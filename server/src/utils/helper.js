import crypto from "crypto";

export const createOTP = async () => {
    // 4 digit number
    const randomNumber = crypto.randomInt(1000, 10000);
    const otp = randomNumber.toString();

    const hash = crypto.createHash('sha-256').update(otp).digest('hex');

    return { otp, hash };
}


export const hashValue = (value) => {
    return crypto
        .createHash("sha256")
        .update(value)
        .digest("hex");
};

export const setExpiry = async () => {
    const now = new Date();
    const expiryDate = new Date(now.getTime() + 5 * 60 * 1000);

    // ALT Way
    // const expiryDate = new Date();
    // expiryDate.setMinutes(expiryDate.getMinutes() + 5);
    
    return expiryDate;
}

export const sanitizeFriendship = (friendship) => {

    const data =
        typeof friendship?.toObject === "function"
            ? friendship.toObject()
            : { ...friendship };

    delete data.secretVerifier;
    delete data.secretSalt;

    return data;
};


export const sanitizeGroup = (group) => {

    const data =
        typeof group?.toObject === "function"
            ? group.toObject()
            : { ...group };

    delete data.secretVerifier;
    delete data.secretSalt;

    return data;
};