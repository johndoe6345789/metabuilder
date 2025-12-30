local Permissions = {}

function Permissions.can_post(user)
  return user and (user.role == "user" or user.role == "moderator" or user.role == "admin" or user.role == "god" or user.role == "supergod")
end

function Permissions.can_moderate(user)
  return user and (user.role == "moderator" or user.role == "admin" or user.role == "god" or user.role == "supergod")
end

return Permissions
