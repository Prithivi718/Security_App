import Group from "../models/group/group.model.js";
import { User } from "../models/auth/user.model.js";

import {
    createSecretVerifier,
} from "../services/crypto.service.js";


// ==================================================
// CREATE GROUP
// ==================================================

export const createGroup = async ({
    name,
    createdBy,
    memberIds = [],
    secretCode,
}) => {

    if (!name || !secretCode) {
        const error = new Error(
            "Group name and shared secret are required"
        );

        error.statusCode = 400;
        throw error;
    }


    // ----------------------------------------------
    // Remove duplicate member IDs
    // ----------------------------------------------

    const uniqueMemberIds = [
        ...new Set(
            [
                createdBy,
                ...memberIds,
            ].map((id) => id.toString())
        ),
    ];


    // ----------------------------------------------
    // Verify users exist
    // ----------------------------------------------

    const users = await User.find({
        _id: {
            $in: uniqueMemberIds,
        },
        status: "active",
    }).select("_id");


    if (
        users.length !== uniqueMemberIds.length
    ) {
        const error = new Error(
            "One or more users do not exist or are inactive"
        );

        error.statusCode = 400;
        throw error;
    }


    // ----------------------------------------------
    // Generate group secret verifier
    // ----------------------------------------------

    const {
        secretVerifier,
        secretSalt,
        kdfSalt,
    } = await createSecretVerifier(secretCode);


    // ----------------------------------------------
    // Create members
    // ----------------------------------------------

    const members = uniqueMemberIds.map(
        (userId) => ({
            userId,

            role:
                userId === createdBy.toString()
                    ? "admin"
                    : "member",

            status: "active",

            joinedAt: new Date(),
        })
    );


    // ----------------------------------------------
    // Create group
    // ----------------------------------------------

    const group = await Group.create({
        name: name.trim(),

        createdBy,

        members,

        status: "active",

        secretVerifier,
        secretSalt,
        kdfSalt,

        cryptoVersion: 1,
    });


    return group;
};


// ==================================================
// GET GROUP
// ==================================================

export const getGroupById = async ({
    groupId,
    userId,
}) => {

    const group = await Group.findById(
        groupId
    );


    if (!group) {
        const error = new Error(
            "Group not found"
        );

        error.statusCode = 404;
        throw error;
    }


    const member = group.members.find(
        (member) =>
            member.userId.toString() ===
            userId.toString() &&
            member.status === "active"
    );


    if (!member) {
        const error = new Error(
            "You are not an active member of this group"
        );

        error.statusCode = 403;
        throw error;
    }


    return group;
};


// ==================================================
// ADD MEMBER
// ==================================================

export const addGroupMember = async ({
    groupId,
    actorUserId,
    newUserId,
}) => {

    const group = await Group.findById(
        groupId
    );


    if (!group) {
        const error = new Error(
            "Group not found"
        );

        error.statusCode = 404;
        throw error;
    }


    // ----------------------------------------------
    // Check actor's role
    // ----------------------------------------------

    const actor = group.members.find(
        (member) =>
            member.userId.toString() ===
            actorUserId.toString() &&
            member.status === "active"
    );


    if (!actor) {
        const error = new Error(
            "You are not a group member"
        );

        error.statusCode = 403;
        throw error;
    }


    if (actor.role !== "admin") {
        const error = new Error(
            "Only group admins can add members"
        );

        error.statusCode = 403;
        throw error;
    }


    // ----------------------------------------------
    // Verify user
    // ----------------------------------------------

    const user = await User.findOne({
        _id: newUserId,
        status: "active",
    });


    if (!user) {
        const error = new Error(
            "User not found or inactive"
        );

        error.statusCode = 404;
        throw error;
    }


    // ----------------------------------------------
    // Existing member?
    // ----------------------------------------------

    const existingMember =
        group.members.find(
            (member) =>
                member.userId.toString() ===
                newUserId.toString()
        );


    if (existingMember) {

        if (
            existingMember.status ===
            "active"
        ) {
            const error = new Error(
                "User is already a group member"
            );

            error.statusCode = 409;
            throw error;
        }


        // Rejoin previously removed/left user
        existingMember.status = "active";
        existingMember.role = "member";
        existingMember.joinedAt = new Date();

    } else {

        group.members.push({
            userId: newUserId,
            role: "member",
            status: "active",
            joinedAt: new Date(),
        });
    }


    await group.save();

    return group;
};


// ==================================================
// REMOVE MEMBER
// ==================================================

export const removeGroupMember = async ({
    groupId,
    actorUserId,
    targetUserId,
}) => {

    const group = await Group.findById(
        groupId
    );


    if (!group) {
        const error = new Error(
            "Group not found"
        );

        error.statusCode = 404;
        throw error;
    }


    const actor = group.members.find(
        (member) =>
            member.userId.toString() ===
            actorUserId.toString() &&
            member.status === "active"
    );


    if (!actor || actor.role !== "admin") {
        const error = new Error(
            "Only group admins can remove members"
        );

        error.statusCode = 403;
        throw error;
    }


    if (
        actorUserId.toString() ===
        targetUserId.toString()
    ) {
        const error = new Error(
            "Admin cannot remove themselves"
        );

        error.statusCode = 400;
        throw error;
    }


    const target = group.members.find(
        (member) =>
            member.userId.toString() ===
            targetUserId.toString() &&
            member.status === "active"
    );


    if (!target) {
        const error = new Error(
            "Active member not found"
        );

        error.statusCode = 404;
        throw error;
    }


    target.status = "removed";

    await group.save();

    return group;
};


// ==================================================
// LEAVE GROUP
// ==================================================

export const leaveGroup = async ({
    groupId,
    userId,
}) => {

    const group = await Group.findById(
        groupId
    );


    if (!group) {
        const error = new Error(
            "Group not found"
        );

        error.statusCode = 404;
        throw error;
    }


    const member = group.members.find(
        (member) =>
            member.userId.toString() ===
            userId.toString() &&
            member.status === "active"
    );


    if (!member) {
        const error = new Error(
            "You are not an active member"
        );

        error.statusCode = 400;
        throw error;
    }


    member.status = "left";


    await group.save();

    return group;
};


// ==================================================
// UPDATE MEMBER ROLE
// ==================================================

export const updateGroupMemberRole = async ({
    groupId,
    actorUserId,
    targetUserId,
    role,
}) => {

    if (!["admin", "member"].includes(role)) {
        const error = new Error(
            "Invalid group role"
        );

        error.statusCode = 400;
        throw error;
    }


    const group = await Group.findById(
        groupId
    );


    if (!group) {
        const error = new Error(
            "Group not found"
        );

        error.statusCode = 404;
        throw error;
    }


    const actor = group.members.find(
        (member) =>
            member.userId.toString() ===
            actorUserId.toString() &&
            member.status === "active"
    );


    if (!actor || actor.role !== "admin") {
        const error = new Error(
            "Only group admins can change member roles"
        );

        error.statusCode = 403;
        throw error;
    }


    const target = group.members.find(
        (member) =>
            member.userId.toString() ===
            targetUserId.toString() &&
            member.status === "active"
    );


    if (!target) {
        const error = new Error(
            "Active member not found"
        );

        error.statusCode = 404;
        throw error;
    }


    target.role = role;

    await group.save();

    return group;
};


// ==================================================
// ARCHIVE GROUP
// ==================================================

export const archiveGroup = async ({
    groupId,
    userId,
}) => {

    const group = await Group.findById(
        groupId
    );


    if (!group) {
        const error = new Error(
            "Group not found"
        );

        error.statusCode = 404;
        throw error;
    }


    const member = group.members.find(
        (member) =>
            member.userId.toString() ===
            userId.toString() &&
            member.status === "active"
    );


    if (!member || member.role !== "admin") {
        const error = new Error(
            "Only group admins can archive the group"
        );

        error.statusCode = 403;
        throw error;
    }


    group.status = "archived";

    await group.save();

    return group;
};