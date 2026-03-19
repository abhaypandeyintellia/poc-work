export const toUserResponseDto = (user) => {
    if(!user) return null;

    return {
        id: user._id,
        username: user.username,
        createdAt: user.createdAt
    };
}

export const toUserListResponseDto = (users = []) => {
    return users.map(toUserResponseDto);
}