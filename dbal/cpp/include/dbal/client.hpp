#ifndef DBAL_CLIENT_HPP
#define DBAL_CLIENT_HPP

#include <memory>
#include <string>
#include "types.hpp"
#include "workflow.hpp"
#include "errors.hpp"
#include "adapters/adapter.hpp"

namespace dbal {

struct ClientConfig {
    std::string mode;
    std::string adapter;
    std::string endpoint;
    std::string database_url;
    bool sandbox_enabled = true;
};

class Client {
public:
    explicit Client(const ClientConfig& config);
    ~Client();

    Client(const Client&) = delete;
    Client& operator=(const Client&) = delete;
    Client(Client&&) = default;
    Client& operator=(Client&&) = default;

    Result<User> createUser(const CreateUserInput& input);
    Result<User> getUser(const std::string& id);
    Result<User> updateUser(const std::string& id, const UpdateUserInput& input);
    Result<bool> deleteUser(const std::string& id);
    Result<std::vector<User>> listUsers(const ListOptions& options);

    Result<PageView> createPage(const CreatePageInput& input);
    Result<PageView> getPage(const std::string& id);
    Result<PageView> getPageBySlug(const std::string& slug);
    Result<PageView> updatePage(const std::string& id, const UpdatePageInput& input);
    Result<bool> deletePage(const std::string& id);
    Result<std::vector<PageView>> listPages(const ListOptions& options);

    Result<Workflow> createWorkflow(const CreateWorkflowInput& input);
    Result<Workflow> getWorkflow(const std::string& id);
    Result<Workflow> updateWorkflow(const std::string& id, const UpdateWorkflowInput& input);
    Result<bool> deleteWorkflow(const std::string& id);
    Result<std::vector<Workflow>> listWorkflows(const ListOptions& options);

    Result<Workflow> createWorkflow(const CreateWorkflowInput& input);
    Result<Workflow> getWorkflow(const std::string& id);
    Result<Workflow> updateWorkflow(const std::string& id, const UpdateWorkflowInput& input);
    Result<bool> deleteWorkflow(const std::string& id);
    Result<std::vector<Workflow>> listWorkflows(const ListOptions& options);

    void close();

private:
    std::unique_ptr<adapters::Adapter> adapter_;
    ClientConfig config_;
};

}

#endif
