module.exports = {
  username: (data) => {
    if (data.trim().length < 3) {
      return false;
    }
    return true;
  },

  name: (data) => {
    if (data.trim().length < 3) {
      return false;
    }
    return true;
  },

  email: (data) => {
    const emailRegex =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(data);
  },
};
