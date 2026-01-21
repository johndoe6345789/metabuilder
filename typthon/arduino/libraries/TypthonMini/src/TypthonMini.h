#pragma once

#include <Arduino.h>
#include <map>
#include <memory>
#include <optional>
#include <functional>
#include <string>
#include <vector>

namespace typthon {

class Interpreter;
struct Statement;
struct Expression;
struct Environment;
struct FunctionObject;
struct ClassObject;
struct InstanceObject;

struct Token {
    enum class Type {
        Identifier,
        Number,
        String,
        Keyword,
        Operator,
        Symbol,
        Newline,
        Indent,
        Dedent,
        End
    } type = Type::End;
    std::string text;
};

class Tokenizer {
  public:
    explicit Tokenizer(const char *source);
    Token next();

  private:
    const char *cursor;
    bool atLineStart = true;
    std::vector<int> indentStack;
    std::vector<Token> pending;

    void emitIndentation(int spaces);
    bool startsWith(const char *literal) const;
    void skipWhitespace();
    void skipComment();
    Token readIdentifier();
    Token readNumber();
    Token readString();
};

enum class ValueKind {
    None,
    Number,
    Boolean,
    Text,
    List,
    Dict,
    Tuple,
    Set,
    Function,
    Class,
    Instance
};

struct Value {
    ValueKind kind = ValueKind::None;
    double number = 0.0;
    bool boolean = false;
    std::string text;
    std::vector<Value> list;
    std::map<std::string, Value> dict;
    std::vector<Value> tuple;
    std::vector<Value> setItems;
    std::shared_ptr<FunctionObject> function;
    std::shared_ptr<ClassObject> classType;
    std::shared_ptr<InstanceObject> instance;

    static Value makeNone();
    static Value makeNumber(double v);
    static Value makeBoolean(bool v);
    static Value makeText(const std::string &v);
    static Value makeList(const std::vector<Value> &items);
    static Value makeDict(const std::map<std::string, Value> &items);
    static Value makeTuple(const std::vector<Value> &items);
    static Value makeSet(const std::vector<Value> &items);
    static Value makeFunction(const std::shared_ptr<FunctionObject> &fn);
    static Value makeClass(const std::shared_ptr<ClassObject> &cls);
    static Value makeInstance(const std::shared_ptr<InstanceObject> &inst);
};

struct Environment {
    std::map<std::string, Value> values;
    std::shared_ptr<Environment> parent;
    std::vector<std::string> globalsDeclared;
    std::vector<std::string> nonlocalsDeclared;

    explicit Environment(std::shared_ptr<Environment> parentEnv = nullptr);
    bool hasLocal(const std::string &name) const;
    bool assign(const std::string &name, const Value &value);
    void define(const std::string &name, const Value &value);
    std::optional<Value> get(const std::string &name) const;
    Value *locate(const std::string &name);
};

struct FunctionObject {
    std::vector<std::string> parameters;
    std::vector<std::shared_ptr<Statement>> body;
    std::shared_ptr<Environment> closure;
    bool isLambda = false;
};

struct ClassObject {
    std::string name;
    std::map<std::string, Value> methods;
};

struct InstanceObject {
    std::shared_ptr<ClassObject> klass;
    std::map<std::string, Value> fields;
};

struct ExecutionResult {
    bool hasReturn = false;
    Value returnValue = Value::makeNone();
    bool breakLoop = false;
    bool continueLoop = false;
    bool hasException = false;
    Value exceptionValue = Value::makeNone();
};

struct Statement {
    virtual ~Statement() = default;
    virtual ExecutionResult execute(Interpreter &interp, std::shared_ptr<Environment> env) = 0;
};

struct Expression {
    virtual ~Expression() = default;
    virtual Value evaluate(Interpreter &interp, std::shared_ptr<Environment> env) = 0;
};

class Interpreter {
  public:
    explicit Interpreter(const char *source);
    void run();

    Value callFunction(const Value &callable, const std::vector<Value> &args);
    Value getAttribute(const Value &base, const std::string &name);
    bool setAttribute(Value &base, const std::string &name, const Value &value);

  private:
    Tokenizer tokenizer;
    Token lookahead;
    bool hasLookahead = false;

    std::vector<std::shared_ptr<Statement>> program;
    std::shared_ptr<Environment> globals;

    Token consume();
    Token peek();
    bool match(Token::Type type, const std::string &text = "");

    std::vector<std::shared_ptr<Statement>> parseStatements();
    std::shared_ptr<Statement> parseStatement();
    std::shared_ptr<Statement> parseSimpleStatement();
    std::shared_ptr<Statement> parseReturn();
    std::shared_ptr<Statement> parseBreak();
    std::shared_ptr<Statement> parseContinue();
    std::shared_ptr<Statement> parsePass();
    std::shared_ptr<Statement> parseAssignmentOrExpr();
    std::shared_ptr<Statement> parseIf();
    std::shared_ptr<Statement> parseWhile();
    std::shared_ptr<Statement> parseFor();
    std::shared_ptr<Statement> parseTry();
    std::shared_ptr<Statement> parseWith();
    std::shared_ptr<Statement> parseImport();
    std::shared_ptr<Statement> parseFromImport();
    std::shared_ptr<Statement> parseRaise();
    std::shared_ptr<Statement> parseAssert();
    std::shared_ptr<Statement> parseYield();
    std::shared_ptr<Statement> parseAwait();
    std::shared_ptr<Statement> parseGlobal();
    std::shared_ptr<Statement> parseNonlocal();
    std::shared_ptr<Statement> parseDef();
    std::shared_ptr<Statement> parseClass();
    std::vector<std::shared_ptr<Statement>> parseSuite();

    std::shared_ptr<Expression> parseExpression();
    std::shared_ptr<Expression> parseLambda();
    std::shared_ptr<Expression> parseOr();
    std::shared_ptr<Expression> parseAnd();
    std::shared_ptr<Expression> parseEquality();
    std::shared_ptr<Expression> parseComparison();
    std::shared_ptr<Expression> parseTerm();
    std::shared_ptr<Expression> parseFactor();
    std::shared_ptr<Expression> parsePower();
    std::shared_ptr<Expression> parseUnary();
    std::shared_ptr<Expression> parseCallOrPrimary();

    std::shared_ptr<Expression> parsePrimary();

    ExecutionResult executeBlock(const std::vector<std::shared_ptr<Statement>> &stmts,
                                 std::shared_ptr<Environment> env);

    void addBuiltin(const std::string &name, const std::function<Value(const std::vector<Value> &)> &fn);
    void initializeBuiltins();
};

} // namespace typthon

