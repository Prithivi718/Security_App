import api from "./api.js";

/**
 * Group Service - Group chat and membership management API integration
 */

export const createGroup = async (name, memberIds = [], secretCode) => {
    if (!name || !secretCode) {
        throw new Error("Group name and shared secret are required");
    }
    return api.post("/group/create", { name, memberIds, secretCode });
};

export const getGroup = async (groupId) => {
    return api.get(`/group/${groupId}`);
};

export const addGroupMember = async (groupId, newUserId) => {
    return api.post(`/group/${groupId}/members`, { newUserId });
};

export const removeGroupMember = async (groupId, targetUserId) => {
    return api.delete(`/group/${groupId}/members/${targetUserId}`);
};

export const leaveGroup = async (groupId) => {
    return api.post(`/group/${groupId}/leave`);
};

export const updateGroupMemberRole = async (groupId, targetUserId, role) => {
    return api.patch(`/group/${groupId}/members/${targetUserId}/role`, { role });
};

export const archiveGroup = async (groupId) => {
    return api.patch(`/group/${groupId}/archive`);
};

export default {
    createGroup,
    getGroup,
    addGroupMember,
    removeGroupMember,
    leaveGroup,
    updateGroupMemberRole,
    archiveGroup
};
