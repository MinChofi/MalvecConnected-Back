const normalizeProfile = (profile = {}) => ({
  fantasyName: profile.fantasyName || "",
  address: profile.address || "",
  phone: profile.phone || "",
  contactEmail: profile.contactEmail || "",
});

const serializeUser = (user) => {
  const id = user._id || user.id;

  return {
    id: id?.toString(),
    username: user.username,
    profile: normalizeProfile(user.profile),
  };
};

module.exports = {
  normalizeProfile,
  serializeUser,
};
