#ifndef DBAL_RPC_USER_ACTIONS_HPP
#define DBAL_RPC_USER_ACTIONS_HPP

#include <functional>
#include <json/json.h>

#include "dbal/core/client.hpp"

namespace dbal {
namespace daemon {
namespace rpc {

using ResponseSender = std::function<void(const ::Json::Value&)>;
using ErrorSender = std::function<void(const std::string&, int)>;

void handle_user_list(Client& client,
                      const std::string& tenantId,
                      const ::Json::Value& options,
                      ResponseSender send_success,
                      ErrorSender send_error);

void handle_user_read(Client& client,
                      const std::string& tenantId,
                      const std::string& id,
                      ResponseSender send_success,
                      ErrorSender send_error);

void handle_user_create(Client& client,
                        const std::string& tenantId,
                        const ::Json::Value& payload,
                        ResponseSender send_success,
                        ErrorSender send_error);

void handle_user_update(Client& client,
                        const std::string& tenantId,
                        const std::string& id,
                        const ::Json::Value& payload,
                        ResponseSender send_success,
                        ErrorSender send_error);

void handle_user_delete(Client& client,
                        const std::string& tenantId,
                        const std::string& id,
                        ResponseSender send_success,
                        ErrorSender send_error);

} // namespace rpc
} // namespace daemon
} // namespace dbal

#endif // DBAL_RPC_USER_ACTIONS_HPP
