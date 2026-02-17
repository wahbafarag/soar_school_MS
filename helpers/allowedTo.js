exports.allowedTo = (roles, userRole) => {
  if (!roles.includes(userRole))
    return {
      error: "You are not authorized to perform this action",
      code: 401,
    };

  return null;
};
