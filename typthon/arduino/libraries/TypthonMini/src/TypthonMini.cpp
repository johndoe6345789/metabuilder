#include "TypthonMini.h"

#include <ctype.h>
#include <math.h>
#include <stdlib.h>

namespace typthon {

namespace {

std::map<const FunctionObject *, std::function<Value(const std::vector<Value> &)>> gBuiltinBodies;

bool isIdentifierStart(char c) {
    return isalpha(static_cast<unsigned char>(c)) || c == '_';
}

bool isIdentifierPart(char c) {
    return isalnum(static_cast<unsigned char>(c)) || c == '_';
}

const char *tokenTypeName(Token::Type type) {
    switch (type) {
    case Token::Type::Identifier:
        return "Identifier";
    case Token::Type::Number:
        return "Number";
    case Token::Type::String:
        return "String";
    case Token::Type::Keyword:
        return "Keyword";
    case Token::Type::Operator:
        return "Operator";
    case Token::Type::Symbol:
        return "Symbol";
    case Token::Type::Newline:
        return "Newline";
    case Token::Type::Indent:
        return "Indent";
    case Token::Type::Dedent:
        return "Dedent";
    case Token::Type::End:
        return "End";
    }
    return "Unknown";
}

void printError(const char *message) {
    Serial.print(F("[TypthonMini] Error: "));
    Serial.println(message);
}

} // namespace

Tokenizer::Tokenizer(const char *source) : cursor(source) { indentStack.push_back(0); }

void Tokenizer::emitIndentation(int spaces) {
    int current = indentStack.back();
    if (spaces > current) {
        indentStack.push_back(spaces);
        pending.push_back({Token::Type::Indent, ""});
    } else {
        while (spaces < current && indentStack.size() > 1) {
            indentStack.pop_back();
            current = indentStack.back();
            pending.push_back({Token::Type::Dedent, ""});
        }
    }
}

bool Tokenizer::startsWith(const char *literal) const {
    const char *p = cursor;
    const char *q = literal;
    while (*q != '\0' && *p == *q) {
        ++p;
        ++q;
    }
    return *q == '\0';
}

void Tokenizer::skipWhitespace() {
    while (*cursor == ' ' || *cursor == '\t' || *cursor == '\r') {
        ++cursor;
    }
}

void Tokenizer::skipComment() {
    if (*cursor == '#') {
        while (*cursor != '\0' && *cursor != '\n') {
            ++cursor;
        }
    }
}

Token Tokenizer::readIdentifier() {
    const char *start = cursor;
    while (isIdentifierPart(*cursor)) {
        ++cursor;
    }
    std::string text(start, cursor);
    static const char *kKeywords[] = {"False",   "None",    "True",  "and",   "as",     "assert",  "async",   "await",
                                      "break",   "class",   "continue",       "def",   "del",    "elif",    "else",   "except",
                                      "finally", "for",     "from",           "global", "if",    "import",  "in",     "is",
                                      "lambda",  "nonlocal", "not",            "or",    "pass",  "raise",   "return", "try",
                                      "while",   "with",    "yield"};
    for (const char *kw : kKeywords) {
        if (text == kw) {
            if (text == "and" || text == "or" || text == "not" || text == "in" || text == "is") {
                return {Token::Type::Operator, text};
            }
            return {Token::Type::Keyword, text};
        }
    }
    return {Token::Type::Identifier, text};
}

Token Tokenizer::readNumber() {
    const char *start = cursor;
    while (isdigit(static_cast<unsigned char>(*cursor)) || *cursor == '.') {
        ++cursor;
    }
    return {Token::Type::Number, std::string(start, cursor)};
}

Token Tokenizer::readString() {
    char quote = *cursor;
    ++cursor;
    const char *start = cursor;
    while (*cursor != quote && *cursor != '\0') {
        ++cursor;
    }
    std::string content(start, cursor);
    if (*cursor == quote) {
        ++cursor;
    }
    return {Token::Type::String, content};
}

Token Tokenizer::next() {
    if (!pending.empty()) {
        Token t = pending.back();
        pending.pop_back();
        return t;
    }

    if (*cursor == '\0') {
        return {Token::Type::End, ""};
    }

    if (atLineStart) {
        int spaces = 0;
        while (*cursor == ' ') {
            ++cursor;
            ++spaces;
        }
        emitIndentation(spaces);
        skipWhitespace();
        atLineStart = false;
        if (!pending.empty()) {
            Token t = pending.back();
            pending.pop_back();
            return t;
        }
    }

    skipComment();
    skipWhitespace();

    if (*cursor == '\n') {
        ++cursor;
        atLineStart = true;
        return {Token::Type::Newline, ""};
    }

    if (*cursor == '\0') {
        while (indentStack.size() > 1) {
            indentStack.pop_back();
            pending.push_back({Token::Type::Dedent, ""});
        }
        if (!pending.empty()) {
            Token t = pending.back();
            pending.pop_back();
            return t;
        }
        return {Token::Type::End, ""};
    }

    if (startsWith("==") || startsWith("!=") || startsWith("<=") || startsWith(">=") || startsWith("//") ||
        startsWith("**")) {
        std::string op(cursor, cursor + 2);
        cursor += 2;
        return {Token::Type::Operator, op};
    }

    if (startsWith("+=") || startsWith("-=") || startsWith("*=") || startsWith("/=") || startsWith("%=") ||
        startsWith("//=") || startsWith("**=")) {
        std::string op(cursor, cursor + 2);
        cursor += 2;
        if ((op == "//" || op == "**") && *cursor == '=') {
            op.push_back('=');
            ++cursor;
        }
        return {Token::Type::Operator, op};
    }

    char c = *cursor;
    if (c == '+' || c == '-' || c == '*' || c == '/' || c == '<' || c == '>' || c == '=' || c == ':' || c == ',' ||
        c == '(' || c == ')' || c == '[' || c == ']' || c == '{' || c == '}' || c == '.' || c == '%' ) {
        ++cursor;
        if (c == '=' || c == '+' || c == '-' || c == '*' || c == '/' || c == '<' || c == '>' || c == '%') {
            return {Token::Type::Operator, std::string(1, c)};
        }
        return {Token::Type::Symbol, std::string(1, c)};
    }

    if (isIdentifierStart(*cursor)) {
        return readIdentifier();
    }
    if (isdigit(static_cast<unsigned char>(*cursor))) {
        return readNumber();
    }
    if (*cursor == '"' || *cursor == 0x27) {
        return readString();
    }

    ++cursor;
    return next();
}

Value Value::makeNone() {
    Value v;
    v.kind = ValueKind::None;
    return v;
}

Value Value::makeNumber(double v) {
    Value val;
    val.kind = ValueKind::Number;
    val.number = v;
    return val;
}

Value Value::makeBoolean(bool v) {
    Value val;
    val.kind = ValueKind::Boolean;
    val.boolean = v;
    return val;
}

Value Value::makeText(const std::string &v) {
    Value val;
    val.kind = ValueKind::Text;
    val.text = v;
    return val;
}

Value Value::makeList(const std::vector<Value> &items) {
    Value val;
    val.kind = ValueKind::List;
    val.list = items;
    return val;
}

Value Value::makeDict(const std::map<std::string, Value> &items) {
    Value val;
    val.kind = ValueKind::Dict;
    val.dict = items;
    return val;
}

Value Value::makeTuple(const std::vector<Value> &items) {
    Value val;
    val.kind = ValueKind::Tuple;
    val.tuple = items;
    return val;
}

Value Value::makeSet(const std::vector<Value> &items) {
    Value val;
    val.kind = ValueKind::Set;
    val.setItems = items;
    return val;
}

Value Value::makeFunction(const std::shared_ptr<FunctionObject> &fn) {
    Value val;
    val.kind = ValueKind::Function;
    val.function = fn;
    return val;
}

Value Value::makeClass(const std::shared_ptr<ClassObject> &cls) {
    Value val;
    val.kind = ValueKind::Class;
    val.classType = cls;
    return val;
}

Value Value::makeInstance(const std::shared_ptr<InstanceObject> &inst) {
    Value val;
    val.kind = ValueKind::Instance;
    val.instance = inst;
    return val;
}

Environment::Environment(std::shared_ptr<Environment> parentEnv) : parent(std::move(parentEnv)) {}

bool Environment::hasLocal(const std::string &name) const { return values.find(name) != values.end(); }

bool Environment::assign(const std::string &name, const Value &value) {
    auto it = values.find(name);
    if (it != values.end()) {
        it->second = value;
        return true;
    }
    if (parent) {
        return parent->assign(name, value);
    }
    return false;
}

void Environment::define(const std::string &name, const Value &value) { values[name] = value; }

std::optional<Value> Environment::get(const std::string &name) const {
    auto it = values.find(name);
    if (it != values.end()) {
        return it->second;
    }
    if (parent) {
        return parent->get(name);
    }
    return std::nullopt;
}

Value *Environment::locate(const std::string &name) {
    auto it = values.find(name);
    if (it != values.end()) {
        return &it->second;
    }
    if (parent) {
        return parent->locate(name);
    }
    return nullptr;
}

static bool containsName(const std::vector<std::string> &names, const std::string &target) {
    for (const auto &n : names) {
        if (n == target) return true;
    }
    return false;
}

static std::shared_ptr<Environment> findRootEnv(std::shared_ptr<Environment> env) {
    while (env->parent) {
        env = env->parent;
    }
    return env;
}

static Value *locateWithDeclarations(std::shared_ptr<Environment> env, const std::string &name) {
    if (containsName(env->globalsDeclared, name)) {
        auto root = findRootEnv(env);
        return root->locate(name);
    }
    if (containsName(env->nonlocalsDeclared, name)) {
        auto cursor = env->parent;
        while (cursor) {
            if (cursor->hasLocal(name)) {
                return cursor->locate(name);
            }
            cursor = cursor->parent;
        }
        return nullptr;
    }
    return env->locate(name);
}

static bool valuesEqual(const Value &a, const Value &b) {
    if (a.kind != b.kind) return false;
    switch (a.kind) {
    case ValueKind::Number:
        return a.number == b.number;
    case ValueKind::Boolean:
        return a.boolean == b.boolean;
    case ValueKind::Text:
        return a.text == b.text;
    case ValueKind::None:
        return true;
    default:
        return a.kind == b.kind;
    }
}

struct LiteralExpression : public Expression {
    Value value;
    explicit LiteralExpression(const Value &v) : value(v) {}
    Value evaluate(Interpreter &, std::shared_ptr<Environment>) override { return value; }
};

struct VariableExpression : public Expression {
    std::string name;
    explicit VariableExpression(std::string n) : name(std::move(n)) {}
    Value evaluate(Interpreter &, std::shared_ptr<Environment> env) override {
        auto found = env->get(name);
        if (!found.has_value()) {
            printError("Unknown variable");
            return Value::makeNone();
        }
        return found.value();
    }
};

struct UnaryExpression : public Expression {
    std::string op;
    std::shared_ptr<Expression> right;
    UnaryExpression(std::string o, std::shared_ptr<Expression> r) : op(std::move(o)), right(std::move(r)) {}
    Value evaluate(Interpreter &interp, std::shared_ptr<Environment> env) override {
        Value r = right->evaluate(interp, env);
        if (op == "-") {
            if (r.kind != ValueKind::Number) {
                printError("Unary - expects number");
                return Value::makeNone();
            }
            return Value::makeNumber(-r.number);
        }
        if (op == "+") {
            return r;
        }
        if (op == "not") {
            if (r.kind != ValueKind::Boolean) {
                printError("not expects boolean");
                return Value::makeNone();
            }
            return Value::makeBoolean(!r.boolean);
        }
        return Value::makeNone();
    }
};

struct BinaryExpression : public Expression {
    std::shared_ptr<Expression> left;
    std::string op;
    std::shared_ptr<Expression> right;
    BinaryExpression(std::shared_ptr<Expression> l, std::string o, std::shared_ptr<Expression> r)
        : left(std::move(l)), op(std::move(o)), right(std::move(r)) {}
    Value evaluate(Interpreter &, std::shared_ptr<Environment> env) override;
};

struct CallExpression : public Expression {
    std::shared_ptr<Expression> callee;
    std::vector<std::shared_ptr<Expression>> args;
    CallExpression(std::shared_ptr<Expression> c, std::vector<std::shared_ptr<Expression>> a)
        : callee(std::move(c)), args(std::move(a)) {}
    Value evaluate(Interpreter &interp, std::shared_ptr<Environment> env) override;
};

struct AttributeExpression : public Expression {
    std::shared_ptr<Expression> base;
    std::string name;
    AttributeExpression(std::shared_ptr<Expression> b, std::string n) : base(std::move(b)), name(std::move(n)) {}
    Value evaluate(Interpreter &interp, std::shared_ptr<Environment> env) override;
};

struct IndexExpression : public Expression {
    std::shared_ptr<Expression> base;
    std::shared_ptr<Expression> index;
    IndexExpression(std::shared_ptr<Expression> b, std::shared_ptr<Expression> i) : base(std::move(b)), index(std::move(i)) {}
    Value evaluate(Interpreter &interp, std::shared_ptr<Environment> env) override;
};

struct ListExpression : public Expression {
    std::vector<std::shared_ptr<Expression>> elements;
    ValueKind containerKind;
    explicit ListExpression(std::vector<std::shared_ptr<Expression>> elts, ValueKind kind = ValueKind::List)
        : elements(std::move(elts)), containerKind(kind) {}
    Value evaluate(Interpreter &interp, std::shared_ptr<Environment> env) override {
        std::vector<Value> values;
        for (const auto &expr : elements) {
            values.push_back(expr->evaluate(interp, env));
        }
        if (containerKind == ValueKind::Tuple) {
            return Value::makeTuple(values);
        }
        if (containerKind == ValueKind::Set) {
            std::vector<Value> unique;
            for (const auto &v : values) {
                bool exists = false;
                for (const auto &u : unique) {
                    if (v.kind == u.kind && ((v.kind == ValueKind::Number && v.number == u.number) ||
                                             (v.kind == ValueKind::Text && v.text == u.text) ||
                                             (v.kind == ValueKind::Boolean && v.boolean == u.boolean))) {
                        exists = true;
                        break;
                    }
                }
                if (!exists) unique.push_back(v);
            }
            return Value::makeSet(unique);
        }
        return Value::makeList(values);
    }
};

struct DictExpression : public Expression {
    std::vector<std::pair<std::shared_ptr<Expression>, std::shared_ptr<Expression>>> pairs;
    explicit DictExpression(std::vector<std::pair<std::shared_ptr<Expression>, std::shared_ptr<Expression>>> p)
        : pairs(std::move(p)) {}
    Value evaluate(Interpreter &interp, std::shared_ptr<Environment> env) override;
};

struct LambdaExpression : public Expression {
    std::vector<std::string> params;
    std::shared_ptr<Expression> body;
    explicit LambdaExpression(std::vector<std::string> p, std::shared_ptr<Expression> b) : params(std::move(p)), body(std::move(b)) {}
    Value evaluate(Interpreter &interp, std::shared_ptr<Environment> env) override;
};

struct ReturnStatement : public Statement {
    std::shared_ptr<Expression> value;
    explicit ReturnStatement(std::shared_ptr<Expression> expr) : value(std::move(expr)) {}
    ExecutionResult execute(Interpreter &interp, std::shared_ptr<Environment> env) override {
        ExecutionResult res;
        res.hasReturn = true;
        if (value) {
            res.returnValue = value->evaluate(interp, env);
        }
        return res;
    }
};

struct BreakStatement : public Statement {
    ExecutionResult execute(Interpreter &, std::shared_ptr<Environment>) override {
        ExecutionResult res;
        res.breakLoop = true;
        return res;
    }
};

struct ContinueStatement : public Statement {
    ExecutionResult execute(Interpreter &, std::shared_ptr<Environment>) override {
        ExecutionResult res;
        res.continueLoop = true;
        return res;
    }
};

struct PassStatement : public Statement {
    ExecutionResult execute(Interpreter &, std::shared_ptr<Environment>) override { return {}; }
};

struct ExpressionStatement : public Statement {
    std::shared_ptr<Expression> expr;
    explicit ExpressionStatement(std::shared_ptr<Expression> e) : expr(std::move(e)) {}
    ExecutionResult execute(Interpreter &interp, std::shared_ptr<Environment> env) override {
        expr->evaluate(interp, env);
        return {};
    }
};

struct AssignmentStatement : public Statement {
    std::shared_ptr<Expression> target;
    std::string op;
    std::shared_ptr<Expression> value;
    AssignmentStatement(std::shared_ptr<Expression> t, std::string o, std::shared_ptr<Expression> v)
        : target(std::move(t)), op(std::move(o)), value(std::move(v)) {}
    ExecutionResult execute(Interpreter &interp, std::shared_ptr<Environment> env) override;
};

struct IfStatement : public Statement {
    std::shared_ptr<Expression> condition;
    std::vector<std::shared_ptr<Statement>> thenBranch;
    std::vector<std::shared_ptr<Statement>> elseBranch;
    IfStatement(std::shared_ptr<Expression> cond, std::vector<std::shared_ptr<Statement>> thenStmts,
                std::vector<std::shared_ptr<Statement>> elseStmts)
        : condition(std::move(cond)), thenBranch(std::move(thenStmts)), elseBranch(std::move(elseStmts)) {}
    ExecutionResult execute(Interpreter &interp, std::shared_ptr<Environment> env) override;
};

struct WhileStatement : public Statement {
    std::shared_ptr<Expression> condition;
    std::vector<std::shared_ptr<Statement>> body;
    WhileStatement(std::shared_ptr<Expression> cond, std::vector<std::shared_ptr<Statement>> stmts)
        : condition(std::move(cond)), body(std::move(stmts)) {}
    ExecutionResult execute(Interpreter &interp, std::shared_ptr<Environment> env) override;
};

struct ForStatement : public Statement {
    std::shared_ptr<Expression> target;
    std::shared_ptr<Expression> iterable;
    std::vector<std::shared_ptr<Statement>> body;
    std::vector<std::shared_ptr<Statement>> elseBody;
    ForStatement(std::shared_ptr<Expression> t, std::shared_ptr<Expression> iter,
                 std::vector<std::shared_ptr<Statement>> b, std::vector<std::shared_ptr<Statement>> e)
        : target(std::move(t)), iterable(std::move(iter)), body(std::move(b)), elseBody(std::move(e)) {}
    ExecutionResult execute(Interpreter &interp, std::shared_ptr<Environment> env) override;
};

struct TryStatement : public Statement {
    std::vector<std::shared_ptr<Statement>> tryBody;
    std::vector<std::shared_ptr<Statement>> exceptBody;
    std::vector<std::shared_ptr<Statement>> finallyBody;
    std::string exceptionName;
    TryStatement(std::vector<std::shared_ptr<Statement>> t, std::vector<std::shared_ptr<Statement>> e,
                 std::vector<std::shared_ptr<Statement>> f, std::string name)
        : tryBody(std::move(t)), exceptBody(std::move(e)), finallyBody(std::move(f)), exceptionName(std::move(name)) {}
    ExecutionResult execute(Interpreter &interp, std::shared_ptr<Environment> env) override;
};

struct WithStatement : public Statement {
    std::shared_ptr<Expression> contextExpr;
    std::string alias;
    std::vector<std::shared_ptr<Statement>> body;
    WithStatement(std::shared_ptr<Expression> ctx, std::string a, std::vector<std::shared_ptr<Statement>> b)
        : contextExpr(std::move(ctx)), alias(std::move(a)), body(std::move(b)) {}
    ExecutionResult execute(Interpreter &interp, std::shared_ptr<Environment> env) override;
};

struct ImportStatement : public Statement {
    std::vector<std::string> names;
    explicit ImportStatement(std::vector<std::string> n) : names(std::move(n)) {}
    ExecutionResult execute(Interpreter &, std::shared_ptr<Environment> env) override {
        for (const auto &name : names) {
            env->define(name, Value::makeNone());
        }
        return {};
    }
};

struct FromImportStatement : public Statement {
    std::string module;
    std::vector<std::string> names;
    FromImportStatement(std::string m, std::vector<std::string> n) : module(std::move(m)), names(std::move(n)) {}
    ExecutionResult execute(Interpreter &, std::shared_ptr<Environment> env) override {
        for (const auto &name : names) {
            env->define(name, Value::makeNone());
        }
        return {};
    }
};

struct RaiseStatement : public Statement {
    std::shared_ptr<Expression> value;
    explicit RaiseStatement(std::shared_ptr<Expression> v) : value(std::move(v)) {}
    ExecutionResult execute(Interpreter &interp, std::shared_ptr<Environment> env) override {
        ExecutionResult res;
        res.hasException = true;
        res.exceptionValue = value ? value->evaluate(interp, env) : Value::makeText("RuntimeError");
        return res;
    }
};

struct AssertStatement : public Statement {
    std::shared_ptr<Expression> condition;
    std::shared_ptr<Expression> message;
    AssertStatement(std::shared_ptr<Expression> c, std::shared_ptr<Expression> m) : condition(std::move(c)), message(std::move(m)) {}
    ExecutionResult execute(Interpreter &interp, std::shared_ptr<Environment> env) override {
        Value cond = condition->evaluate(interp, env);
        if (cond.kind != ValueKind::Boolean || !cond.boolean) {
            ExecutionResult res;
            res.hasException = true;
            res.exceptionValue = message ? message->evaluate(interp, env) : Value::makeText("AssertionError");
            printError("Assertion failed");
            return res;
        }
        return {};
    }
};

struct YieldStatement : public Statement {
    std::shared_ptr<Expression> value;
    explicit YieldStatement(std::shared_ptr<Expression> v) : value(std::move(v)) {}
    ExecutionResult execute(Interpreter &interp, std::shared_ptr<Environment> env) override {
        ExecutionResult res;
        res.hasReturn = true;
        res.returnValue = value ? value->evaluate(interp, env) : Value::makeNone();
        return res;
    }
};

struct AwaitStatement : public Statement {
    std::shared_ptr<Expression> value;
    explicit AwaitStatement(std::shared_ptr<Expression> v) : value(std::move(v)) {}
    ExecutionResult execute(Interpreter &interp, std::shared_ptr<Environment> env) override {
        if (value) {
            value->evaluate(interp, env);
        }
        return {};
    }
};

struct GlobalStatement : public Statement {
    std::vector<std::string> names;
    explicit GlobalStatement(std::vector<std::string> n) : names(std::move(n)) {}
    ExecutionResult execute(Interpreter &, std::shared_ptr<Environment> env) override {
        for (const auto &n : names) {
            if (!containsName(env->globalsDeclared, n)) env->globalsDeclared.push_back(n);
        }
        return {};
    }
};

struct NonlocalStatement : public Statement {
    std::vector<std::string> names;
    explicit NonlocalStatement(std::vector<std::string> n) : names(std::move(n)) {}
    ExecutionResult execute(Interpreter &, std::shared_ptr<Environment> env) override {
        for (const auto &n : names) {
            if (!containsName(env->nonlocalsDeclared, n)) env->nonlocalsDeclared.push_back(n);
        }
        return {};
    }
};

struct FunctionDefStatement : public Statement {
    std::string name;
    std::vector<std::string> params;
    std::vector<std::shared_ptr<Statement>> body;
    FunctionDefStatement(std::string n, std::vector<std::string> p, std::vector<std::shared_ptr<Statement>> b)
        : name(std::move(n)), params(std::move(p)), body(std::move(b)) {}
    ExecutionResult execute(Interpreter &, std::shared_ptr<Environment> env) override;
};

struct ClassDefStatement : public Statement {
    std::string name;
    std::vector<std::shared_ptr<Statement>> body;
    explicit ClassDefStatement(std::string n, std::vector<std::shared_ptr<Statement>> b) : name(std::move(n)), body(std::move(b)) {}
    ExecutionResult execute(Interpreter &, std::shared_ptr<Environment> env) override;
};

Interpreter::Interpreter(const char *source) : tokenizer(source), globals(std::make_shared<Environment>()) {
    initializeBuiltins();
    program = parseStatements();
}

void Interpreter::initializeBuiltins() {
    addBuiltin("print", [](const std::vector<Value> &args) {
        for (size_t i = 0; i < args.size(); ++i) {
            const Value &v = args[i];
            switch (v.kind) {
            case ValueKind::Number:
                Serial.print(v.number, 6);
                break;
            case ValueKind::Boolean:
                Serial.print(v.boolean ? F("True") : F("False"));
                break;
            case ValueKind::Text:
                Serial.print(v.text.c_str());
                break;
            case ValueKind::List:
                Serial.print('[');
                for (size_t j = 0; j < v.list.size(); ++j) {
                    if (j) Serial.print(F(", "));
                    const Value &lv = v.list[j];
                    if (lv.kind == ValueKind::Number) Serial.print(lv.number, 6);
                    else if (lv.kind == ValueKind::Text) Serial.print(lv.text.c_str());
                    else Serial.print(F("..."));
                }
                Serial.print(']');
                break;
            case ValueKind::Tuple:
                Serial.print('(');
                for (size_t j = 0; j < v.tuple.size(); ++j) {
                    if (j) Serial.print(F(", "));
                    const Value &lv = v.tuple[j];
                    if (lv.kind == ValueKind::Number) Serial.print(lv.number, 6);
                    else if (lv.kind == ValueKind::Text) Serial.print(lv.text.c_str());
                    else Serial.print(F("..."));
                }
                Serial.print(')');
                break;
            case ValueKind::Set:
                Serial.print('{');
                for (size_t j = 0; j < v.setItems.size(); ++j) {
                    if (j) Serial.print(F(", "));
                    const Value &lv = v.setItems[j];
                    if (lv.kind == ValueKind::Number) Serial.print(lv.number, 6);
                    else if (lv.kind == ValueKind::Text) Serial.print(lv.text.c_str());
                    else Serial.print(F("..."));
                }
                Serial.print('}');
                break;
            case ValueKind::Dict:
                Serial.print('{');
                for (auto it = v.dict.begin(); it != v.dict.end(); ++it) {
                    if (it != v.dict.begin()) Serial.print(F(", "));
                    Serial.print(it->first.c_str());
                    Serial.print(F(": "));
                    if (it->second.kind == ValueKind::Number) Serial.print(it->second.number, 6);
                    else if (it->second.kind == ValueKind::Text) Serial.print(it->second.text.c_str());
                    else Serial.print(F("..."));
                }
                Serial.print('}');
                break;
            case ValueKind::None:
                Serial.print(F("None"));
                break;
            default:
                Serial.print(F("<object>"));
                break;
            }
            if (i + 1 < args.size()) {
                Serial.print(' ');
            }
        }
        Serial.println();
        return Value::makeNone();
    });

    addBuiltin("sleep", [](const std::vector<Value> &args) {
        if (args.empty() || args[0].kind != ValueKind::Number) {
            printError("sleep expects numeric seconds");
            return Value::makeNone();
        }
        delay(static_cast<unsigned long>(args[0].number * 1000.0));
        return Value::makeNone();
    });
}

void Interpreter::addBuiltin(const std::string &name, const std::function<Value(const std::vector<Value> &)> &fn) {
    auto wrapper = std::make_shared<FunctionObject>();
    wrapper->parameters = {"*args"};
    wrapper->closure = globals;
    wrapper->isLambda = true;
    wrapper->body.push_back(std::make_shared<ReturnStatement>(nullptr));
    globals->define(name, Value::makeFunction(wrapper));
    gBuiltinBodies[wrapper.get()] = fn;
    // Attach an evaluator via lambda capture.
    wrapper->body.clear();
    wrapper->body.push_back(nullptr); // placeholder indicates builtin
    // We rely on callFunction recognizing placeholder body.
}

Token Interpreter::consume() {
    if (hasLookahead) {
        hasLookahead = false;
        return lookahead;
    }
    return tokenizer.next();
}

Token Interpreter::peek() {
    if (!hasLookahead) {
        lookahead = tokenizer.next();
        hasLookahead = true;
    }
    return lookahead;
}

bool Interpreter::match(Token::Type type, const std::string &text) {
    Token token = peek();
    if (token.type == type && (text.empty() || token.text == text)) {
        consume();
        return true;
    }
    return false;
}

std::vector<std::shared_ptr<Statement>> Interpreter::parseStatements() {
    std::vector<std::shared_ptr<Statement>> stmts;
    while (true) {
        Token t = peek();
        if (t.type == Token::Type::End || t.type == Token::Type::Dedent) {
            break;
        }
        if (t.type == Token::Type::Newline) {
            consume();
            continue;
        }
        stmts.push_back(parseStatement());
    }
    return stmts;
}

std::shared_ptr<Statement> Interpreter::parseStatement() {
    Token t = peek();
    if (t.type == Token::Type::Keyword) {
        if (t.text == "if") return parseIf();
        if (t.text == "while") return parseWhile();
        if (t.text == "for") return parseFor();
        if (t.text == "def") return parseDef();
        if (t.text == "class") return parseClass();
        if (t.text == "return") return parseReturn();
        if (t.text == "break") return parseBreak();
        if (t.text == "continue") return parseContinue();
        if (t.text == "pass") return parsePass();
        if (t.text == "try") return parseTry();
        if (t.text == "with") return parseWith();
        if (t.text == "import") return parseImport();
        if (t.text == "from") return parseFromImport();
        if (t.text == "raise") return parseRaise();
        if (t.text == "assert") return parseAssert();
        if (t.text == "yield") return parseYield();
        if (t.text == "await") return parseAwait();
        if (t.text == "global") return parseGlobal();
        if (t.text == "nonlocal") return parseNonlocal();
    }
    return parseSimpleStatement();
}

std::shared_ptr<Statement> Interpreter::parseSimpleStatement() {
    return parseAssignmentOrExpr();
}

std::shared_ptr<Statement> Interpreter::parseReturn() {
    consume();
    Token t = peek();
    if (t.type == Token::Type::Newline || t.type == Token::Type::Dedent || t.type == Token::Type::End) {
        return std::make_shared<ReturnStatement>(nullptr);
    }
    auto expr = parseExpression();
    match(Token::Type::Newline);
    return std::make_shared<ReturnStatement>(expr);
}

std::shared_ptr<Statement> Interpreter::parseBreak() {
    consume();
    match(Token::Type::Newline);
    return std::make_shared<BreakStatement>();
}

std::shared_ptr<Statement> Interpreter::parseContinue() {
    consume();
    match(Token::Type::Newline);
    return std::make_shared<ContinueStatement>();
}

std::shared_ptr<Statement> Interpreter::parsePass() {
    consume();
    match(Token::Type::Newline);
    return std::make_shared<PassStatement>();
}

std::shared_ptr<Statement> Interpreter::parseAssignmentOrExpr() {
    auto expr = parseExpression();
    Token t = peek();
    if (t.type == Token::Type::Operator &&
        (t.text == "=" || t.text == "+=" || t.text == "-=" || t.text == "*=" || t.text == "/=" || t.text == "%=" ||
         t.text == "//=" || t.text == "**=")) {
        consume();
        auto valueExpr = parseExpression();
        match(Token::Type::Newline);
        return std::make_shared<AssignmentStatement>(expr, t.text, valueExpr);
    }
    match(Token::Type::Newline);
    return std::make_shared<ExpressionStatement>(expr);
}

std::shared_ptr<Statement> Interpreter::parseIf() {
    consume();
    auto condition = parseExpression();
    if (!match(Token::Type::Symbol, ":")) {
        printError("Expected : after if condition");
    }
    match(Token::Type::Newline);
    auto thenSuite = parseSuite();
    std::vector<std::shared_ptr<Statement>> elseSuite;
    if (match(Token::Type::Keyword, "elif")) {
        auto nested = parseIf();
        elseSuite.push_back(nested);
    } else if (match(Token::Type::Keyword, "else")) {
        if (!match(Token::Type::Symbol, ":")) {
            printError("Expected : after else");
        }
        match(Token::Type::Newline);
        elseSuite = parseSuite();
    }
    return std::make_shared<IfStatement>(condition, thenSuite, elseSuite);
}

std::shared_ptr<Statement> Interpreter::parseWhile() {
    consume();
    auto condition = parseExpression();
    if (!match(Token::Type::Symbol, ":")) {
        printError("Expected : after while condition");
    }
    match(Token::Type::Newline);
    auto body = parseSuite();
    return std::make_shared<WhileStatement>(condition, body);
}

std::shared_ptr<Statement> Interpreter::parseFor() {
    consume();
    auto target = parseExpression();
    if (!match(Token::Type::Operator, "in")) {
        printError("Expected in after for target");
    }
    auto iterExpr = parseExpression();
    if (!match(Token::Type::Symbol, ":")) {
        printError("Expected : after for header");
    }
    match(Token::Type::Newline);
    auto body = parseSuite();
    std::vector<std::shared_ptr<Statement>> elseSuite;
    if (match(Token::Type::Keyword, "else")) {
        match(Token::Type::Symbol, ":");
        match(Token::Type::Newline);
        elseSuite = parseSuite();
    }
    return std::make_shared<ForStatement>(target, iterExpr, body, elseSuite);
}

std::shared_ptr<Statement> Interpreter::parseTry() {
    consume();
    if (!match(Token::Type::Symbol, ":")) {
        printError("Expected : after try");
    }
    match(Token::Type::Newline);
    auto trySuite = parseSuite();
    std::vector<std::shared_ptr<Statement>> exceptSuite;
    std::vector<std::shared_ptr<Statement>> finallySuite;
    std::string name;
    if (match(Token::Type::Keyword, "except")) {
        Token maybeName = peek();
        if (maybeName.type == Token::Type::Identifier) {
            name = maybeName.text;
            consume();
        }
        match(Token::Type::Symbol, ":");
        match(Token::Type::Newline);
        exceptSuite = parseSuite();
    }
    if (match(Token::Type::Keyword, "finally")) {
        match(Token::Type::Symbol, ":");
        match(Token::Type::Newline);
        finallySuite = parseSuite();
    }
    if (exceptSuite.empty() && finallySuite.empty()) {
        printError("try requires except or finally");
    }
    return std::make_shared<TryStatement>(trySuite, exceptSuite, finallySuite, name);
}

std::shared_ptr<Statement> Interpreter::parseWith() {
    consume();
    auto ctxExpr = parseExpression();
    std::string alias;
    if (match(Token::Type::Keyword, "as")) {
        Token nameTok = consume();
        if (nameTok.type == Token::Type::Identifier) {
            alias = nameTok.text;
        }
    }
    match(Token::Type::Symbol, ":");
    match(Token::Type::Newline);
    auto body = parseSuite();
    return std::make_shared<WithStatement>(ctxExpr, alias, body);
}

std::shared_ptr<Statement> Interpreter::parseImport() {
    consume();
    std::vector<std::string> names;
    do {
        Token nameTok = consume();
        if (nameTok.type == Token::Type::Identifier) {
            names.push_back(nameTok.text);
        }
    } while (match(Token::Type::Symbol, ","));
    match(Token::Type::Newline);
    return std::make_shared<ImportStatement>(names);
}

std::shared_ptr<Statement> Interpreter::parseFromImport() {
    consume();
    Token moduleTok = consume();
    if (moduleTok.type != Token::Type::Identifier) {
        printError("Expected module name");
    }
    match(Token::Type::Keyword, "import");
    std::vector<std::string> names;
    do {
        Token nameTok = consume();
        if (nameTok.type == Token::Type::Identifier) {
            names.push_back(nameTok.text);
        }
    } while (match(Token::Type::Symbol, ","));
    match(Token::Type::Newline);
    return std::make_shared<FromImportStatement>(moduleTok.text, names);
}

std::shared_ptr<Statement> Interpreter::parseRaise() {
    consume();
    Token t = peek();
    std::shared_ptr<Expression> expr = nullptr;
    if (t.type != Token::Type::Newline && t.type != Token::Type::Dedent && t.type != Token::Type::End) {
        expr = parseExpression();
    }
    match(Token::Type::Newline);
    return std::make_shared<RaiseStatement>(expr);
}

std::shared_ptr<Statement> Interpreter::parseAssert() {
    consume();
    auto cond = parseExpression();
    std::shared_ptr<Expression> msg = nullptr;
    if (match(Token::Type::Symbol, ",")) {
        msg = parseExpression();
    }
    match(Token::Type::Newline);
    return std::make_shared<AssertStatement>(cond, msg);
}

std::shared_ptr<Statement> Interpreter::parseYield() {
    consume();
    Token t = peek();
    std::shared_ptr<Expression> expr = nullptr;
    if (t.type != Token::Type::Newline && t.type != Token::Type::Dedent && t.type != Token::Type::End) {
        expr = parseExpression();
    }
    match(Token::Type::Newline);
    return std::make_shared<YieldStatement>(expr);
}

std::shared_ptr<Statement> Interpreter::parseAwait() {
    consume();
    Token t = peek();
    std::shared_ptr<Expression> expr = nullptr;
    if (t.type != Token::Type::Newline && t.type != Token::Type::Dedent && t.type != Token::Type::End) {
        expr = parseExpression();
    }
    match(Token::Type::Newline);
    return std::make_shared<AwaitStatement>(expr);
}

std::shared_ptr<Statement> Interpreter::parseGlobal() {
    consume();
    std::vector<std::string> names;
    do {
        Token nameTok = consume();
        if (nameTok.type == Token::Type::Identifier) names.push_back(nameTok.text);
    } while (match(Token::Type::Symbol, ","));
    match(Token::Type::Newline);
    return std::make_shared<GlobalStatement>(names);
}

std::shared_ptr<Statement> Interpreter::parseNonlocal() {
    consume();
    std::vector<std::string> names;
    do {
        Token nameTok = consume();
        if (nameTok.type == Token::Type::Identifier) names.push_back(nameTok.text);
    } while (match(Token::Type::Symbol, ","));
    match(Token::Type::Newline);
    return std::make_shared<NonlocalStatement>(names);
}

std::shared_ptr<Statement> Interpreter::parseDef() {
    consume();
    Token nameTok = consume();
    if (nameTok.type != Token::Type::Identifier) {
        printError("Expected function name");
        return std::make_shared<ExpressionStatement>(std::make_shared<LiteralExpression>(Value::makeNone()));
    }
    if (!match(Token::Type::Symbol, "(")) {
        printError("Expected (");
    }
    std::vector<std::string> params;
    Token nextTok = peek();
    if (!(nextTok.type == Token::Type::Symbol && nextTok.text == ")")) {
        do {
            Token paramTok = consume();
            if (paramTok.type != Token::Type::Identifier) {
                printError("Invalid parameter name");
                break;
            }
            params.push_back(paramTok.text);
        } while (match(Token::Type::Symbol, ","));
    }
    if (!match(Token::Type::Symbol, ")")) {
        printError("Expected ) after parameters");
    }
    if (!match(Token::Type::Symbol, ":")) {
        printError("Expected : after function header");
    }
    match(Token::Type::Newline);
    auto suite = parseSuite();
    return std::make_shared<FunctionDefStatement>(nameTok.text, params, suite);
}

std::shared_ptr<Statement> Interpreter::parseClass() {
    consume();
    Token nameTok = consume();
    if (nameTok.type != Token::Type::Identifier) {
        printError("Expected class name");
        return std::make_shared<ExpressionStatement>(std::make_shared<LiteralExpression>(Value::makeNone()));
    }
    if (!match(Token::Type::Symbol, ":")) {
        printError("Expected : after class name");
    }
    match(Token::Type::Newline);
    auto body = parseSuite();
    return std::make_shared<ClassDefStatement>(nameTok.text, body);
}

std::vector<std::shared_ptr<Statement>> Interpreter::parseSuite() {
    if (!match(Token::Type::Indent)) {
        printError("Expected indent for suite");
    }
    auto stmts = parseStatements();
    if (!match(Token::Type::Dedent)) {
        printError("Expected dedent after suite");
    }
    return stmts;
}

std::shared_ptr<Expression> Interpreter::parseExpression() { return parseLambda(); }

std::shared_ptr<Expression> Interpreter::parseLambda() {
    if (match(Token::Type::Keyword, "lambda")) {
        std::vector<std::string> params;
        Token t = peek();
        if (!(t.type == Token::Type::Symbol && t.text == ":")) {
            do {
                Token nameTok = consume();
                if (nameTok.type != Token::Type::Identifier) {
                    printError("Invalid lambda parameter");
                    break;
                }
                params.push_back(nameTok.text);
            } while (match(Token::Type::Symbol, ","));
        }
        if (!match(Token::Type::Symbol, ":")) {
            printError("Expected : after lambda parameters");
        }
        auto body = parseExpression();
        return std::make_shared<LambdaExpression>(params, body);
    }
    return parseOr();
}

std::shared_ptr<Expression> Interpreter::parseOr() {
    auto expr = parseAnd();
    while (match(Token::Type::Operator, "or")) {
        auto right = parseAnd();
        expr = std::make_shared<BinaryExpression>(expr, "or", right);
    }
    return expr;
}

std::shared_ptr<Expression> Interpreter::parseAnd() {
    auto expr = parseEquality();
    while (match(Token::Type::Operator, "and")) {
        auto right = parseEquality();
        expr = std::make_shared<BinaryExpression>(expr, "and", right);
    }
    return expr;
}

std::shared_ptr<Expression> Interpreter::parseEquality() {
    auto expr = parseComparison();
    while (true) {
        Token t = peek();
        if (t.type == Token::Type::Operator && (t.text == "==" || t.text == "!=")) {
            consume();
            auto right = parseComparison();
            expr = std::make_shared<BinaryExpression>(expr, t.text, right);
        } else {
            break;
        }
    }
    return expr;
}

std::shared_ptr<Expression> Interpreter::parseComparison() {
    auto expr = parseTerm();
    while (true) {
        Token t = peek();
        if (t.type == Token::Type::Operator &&
            (t.text == "<" || t.text == ">" || t.text == "<=" || t.text == ">=" || t.text == "in" || t.text == "is")) {
            consume();
            auto right = parseTerm();
            expr = std::make_shared<BinaryExpression>(expr, t.text, right);
            continue;
        }
        if (match(Token::Type::Operator, "not")) {
            if (match(Token::Type::Operator, "in")) {
                auto right = parseTerm();
                expr = std::make_shared<BinaryExpression>(expr, "not in", right);
                continue;
            }
        }
        break;
    }
    return expr;
}

std::shared_ptr<Expression> Interpreter::parseTerm() {
    auto expr = parseFactor();
    while (true) {
        Token t = peek();
        if (t.type == Token::Type::Operator && (t.text == "+" || t.text == "-")) {
            consume();
            auto right = parseFactor();
            expr = std::make_shared<BinaryExpression>(expr, t.text, right);
        } else {
            break;
        }
    }
    return expr;
}

std::shared_ptr<Expression> Interpreter::parseFactor() {
    auto expr = parsePower();
    while (true) {
        Token t = peek();
        if (t.type == Token::Type::Operator && (t.text == "*" || t.text == "/" || t.text == "//" || t.text == "%")) {
            consume();
            auto right = parsePower();
            expr = std::make_shared<BinaryExpression>(expr, t.text, right);
        } else {
            break;
        }
    }
    return expr;
}

std::shared_ptr<Expression> Interpreter::parsePower() {
    auto expr = parseUnary();
    while (match(Token::Type::Operator, "**")) {
        auto right = parseUnary();
        expr = std::make_shared<BinaryExpression>(expr, "**", right);
    }
    return expr;
}

std::shared_ptr<Expression> Interpreter::parseUnary() {
    Token t = peek();
    if (t.type == Token::Type::Operator && (t.text == "-" || t.text == "+")) {
        consume();
        auto right = parseUnary();
        return std::make_shared<UnaryExpression>(t.text, right);
    }
    if (t.type == Token::Type::Operator && t.text == "not") {
        consume();
        auto right = parseUnary();
        return std::make_shared<UnaryExpression>("not", right);
    }
    return parseCallOrPrimary();
}

std::shared_ptr<Expression> Interpreter::parseCallOrPrimary() {
    auto expr = parsePrimary();
    while (true) {
        if (match(Token::Type::Symbol, "(")) {
            std::vector<std::shared_ptr<Expression>> args;
            Token t = peek();
            if (!(t.type == Token::Type::Symbol && t.text == ")")) {
                do {
                    args.push_back(parseExpression());
                } while (match(Token::Type::Symbol, ","));
            }
            if (!match(Token::Type::Symbol, ")")) {
                printError("Expected ) in call");
            }
            expr = std::make_shared<CallExpression>(expr, args);
            continue;
        }
        if (match(Token::Type::Symbol, ".")) {
            Token nameTok = consume();
            if (nameTok.type != Token::Type::Identifier) {
                printError("Expected attribute name");
                break;
            }
            expr = std::make_shared<AttributeExpression>(expr, nameTok.text);
            continue;
        }
        if (match(Token::Type::Symbol, "[")) {
            auto index = parseExpression();
            if (!match(Token::Type::Symbol, "]")) {
                printError("Expected ]");
            }
            expr = std::make_shared<IndexExpression>(expr, index);
            continue;
        }
        break;
    }
    return expr;
}

std::shared_ptr<Expression> Interpreter::parsePrimary() {
    Token t = consume();
    switch (t.type) {
    case Token::Type::Number:
        return std::make_shared<LiteralExpression>(Value::makeNumber(strtod(t.text.c_str(), nullptr)));
    case Token::Type::String:
        return std::make_shared<LiteralExpression>(Value::makeText(t.text));
    case Token::Type::Identifier:
        return std::make_shared<VariableExpression>(t.text);
    case Token::Type::Keyword:
        if (t.text == "True") return std::make_shared<LiteralExpression>(Value::makeBoolean(true));
        if (t.text == "False") return std::make_shared<LiteralExpression>(Value::makeBoolean(false));
        if (t.text == "None") return std::make_shared<LiteralExpression>(Value::makeNone());
        break;
    case Token::Type::Symbol:
        if (t.text == "(") {
            std::vector<std::shared_ptr<Expression>> elements;
            Token nextTok = peek();
            if (!(nextTok.type == Token::Type::Symbol && nextTok.text == ")")) {
                elements.push_back(parseExpression());
                while (match(Token::Type::Symbol, ",")) {
                    Token afterComma = peek();
                    if (afterComma.type == Token::Type::Symbol && afterComma.text == ")") break;
                    elements.push_back(parseExpression());
                }
            }
            match(Token::Type::Symbol, ")");
            if (elements.size() == 1) {
                return elements.front();
            }
            return std::make_shared<ListExpression>(elements, ValueKind::Tuple);
        }
        if (t.text == "[") {
            std::vector<std::shared_ptr<Expression>> elements;
            Token nextTok = peek();
            if (!(nextTok.type == Token::Type::Symbol && nextTok.text == "]")) {
                do {
                    elements.push_back(parseExpression());
                } while (match(Token::Type::Symbol, ","));
            }
            match(Token::Type::Symbol, "]");
            return std::make_shared<ListExpression>(elements, ValueKind::List);
        }
        if (t.text == "{") {
            Token nextTok = peek();
            if (nextTok.type == Token::Type::Symbol && nextTok.text == "}") {
                consume();
                return std::make_shared<DictExpression>(std::vector<std::pair<std::shared_ptr<Expression>, std::shared_ptr<Expression>>>{});
            }
            auto firstExpr = parseExpression();
            if (match(Token::Type::Symbol, ":")) {
                std::vector<std::pair<std::shared_ptr<Expression>, std::shared_ptr<Expression>>> pairs;
                auto valueExpr = parseExpression();
                pairs.push_back({firstExpr, valueExpr});
                while (match(Token::Type::Symbol, ",")) {
                    Token look = peek();
                    if (look.type == Token::Type::Symbol && look.text == "}") break;
                    auto keyExpr = parseExpression();
                    match(Token::Type::Symbol, ":");
                    auto vExpr = parseExpression();
                    pairs.push_back({keyExpr, vExpr});
                }
                match(Token::Type::Symbol, "}");
                return std::make_shared<DictExpression>(pairs);
            }
            std::vector<std::shared_ptr<Expression>> setItems;
            setItems.push_back(firstExpr);
            while (match(Token::Type::Symbol, ",")) {
                Token look = peek();
                if (look.type == Token::Type::Symbol && look.text == "}") break;
                setItems.push_back(parseExpression());
            }
            match(Token::Type::Symbol, "}");
            return std::make_shared<ListExpression>(setItems, ValueKind::Set);
        }
        break;
    default:
        break;
    }
    printError("Unexpected token in expression");
    return std::make_shared<LiteralExpression>(Value::makeNone());
}

ExecutionResult Interpreter::executeBlock(const std::vector<std::shared_ptr<Statement>> &stmts,
                                          std::shared_ptr<Environment> env) {
    for (const auto &stmt : stmts) {
        ExecutionResult result = stmt->execute(*this, env);
        if (result.hasReturn || result.breakLoop || result.continueLoop || result.hasException) {
            return result;
        }
    }
    return {};
}

void Interpreter::run() { executeBlock(program, globals); }

Value BinaryExpression::evaluate(Interpreter &interp, std::shared_ptr<Environment> env) {
    Value l = left->evaluate(interp, env);
    Value r = right->evaluate(interp, env);
    if (op == "+") {
        if (l.kind == ValueKind::Number && r.kind == ValueKind::Number) {
            return Value::makeNumber(l.number + r.number);
        }
        if (l.kind == ValueKind::Text && r.kind == ValueKind::Text) {
            return Value::makeText(l.text + r.text);
        }
        if (l.kind == ValueKind::List && r.kind == ValueKind::List) {
            std::vector<Value> combined = l.list;
            combined.insert(combined.end(), r.list.begin(), r.list.end());
            return Value::makeList(combined);
        }
        printError("Type mismatch for +");
        return Value::makeNone();
    }
    if (op == "-") {
        if (l.kind == ValueKind::Number && r.kind == ValueKind::Number) {
            return Value::makeNumber(l.number - r.number);
        }
        printError("Type mismatch for -");
        return Value::makeNone();
    }
    if (op == "*") {
        if (l.kind == ValueKind::Number && r.kind == ValueKind::Number) {
            return Value::makeNumber(l.number * r.number);
        }
        printError("Type mismatch for *");
        return Value::makeNone();
    }
    if (op == "%") {
        if (l.kind == ValueKind::Number && r.kind == ValueKind::Number) {
            if (r.number == 0) {
                printError("Modulo by zero");
                return Value::makeNone();
            }
            return Value::makeNumber(fmod(l.number, r.number));
        }
        printError("Type mismatch for %");
        return Value::makeNone();
    }
    if (op == "/") {
        if (l.kind == ValueKind::Number && r.kind == ValueKind::Number) {
            if (r.number == 0) {
                printError("Division by zero");
                return Value::makeNone();
            }
            return Value::makeNumber(l.number / r.number);
        }
        printError("Type mismatch for /");
        return Value::makeNone();
    }
    if (op == "//") {
        if (l.kind == ValueKind::Number && r.kind == ValueKind::Number) {
            if (r.number == 0) {
                printError("Division by zero");
                return Value::makeNone();
            }
            return Value::makeNumber(floor(l.number / r.number));
        }
        printError("Type mismatch for //");
        return Value::makeNone();
    }
    if (op == "**") {
        if (l.kind == ValueKind::Number && r.kind == ValueKind::Number) {
            return Value::makeNumber(pow(l.number, r.number));
        }
        printError("Type mismatch for **");
        return Value::makeNone();
    }
    if (op == "==") {
        return Value::makeBoolean(valuesEqual(l, r));
    }
    if (op == "!=") {
        auto eq = BinaryExpression(left, "==", right).evaluate(interp, env);
        return Value::makeBoolean(eq.boolean == false);
    }
    if (op == "<" || op == ">" || op == "<=" || op == ">=") {
        if (l.kind != ValueKind::Number || r.kind != ValueKind::Number) {
            printError("Comparison expects numbers");
            return Value::makeNone();
        }
        bool result = false;
        if (op == "<") result = l.number < r.number;
        if (op == ">") result = l.number > r.number;
        if (op == "<=") result = l.number <= r.number;
        if (op == ">=") result = l.number >= r.number;
        return Value::makeBoolean(result);
    }
    if (op == "is") {
        bool same = l.kind == r.kind;
        if (same && l.kind == ValueKind::Instance) same = l.instance == r.instance;
        if (same && l.kind == ValueKind::Class) same = l.classType == r.classType;
        if (same && l.kind == ValueKind::Function) same = l.function == r.function;
        return Value::makeBoolean(same);
    }
    if (op == "in" || op == "not in") {
        bool contained = false;
        const Value &container = r;
        if (container.kind == ValueKind::List || container.kind == ValueKind::Tuple || container.kind == ValueKind::Set) {
            const auto &seq = (container.kind == ValueKind::List) ? container.list
                                 : (container.kind == ValueKind::Tuple) ? container.tuple
                                                                        : container.setItems;
            for (const auto &item : seq) {
                if (valuesEqual(l, item)) {
                    contained = true;
                    break;
                }
            }
        } else if (container.kind == ValueKind::Dict) {
            if (l.kind == ValueKind::Text) {
                contained = container.dict.find(l.text) != container.dict.end();
            }
        } else if (container.kind == ValueKind::Text && l.kind == ValueKind::Text) {
            contained = container.text.find(l.text) != std::string::npos;
        }
        if (op == "not in") contained = !contained;
        return Value::makeBoolean(contained);
    }
    if (op == "and") {
        if (l.kind != ValueKind::Boolean || r.kind != ValueKind::Boolean) {
            printError("and expects booleans");
            return Value::makeNone();
        }
        return Value::makeBoolean(l.boolean && r.boolean);
    }
    if (op == "or") {
        if (l.kind != ValueKind::Boolean || r.kind != ValueKind::Boolean) {
            printError("or expects booleans");
            return Value::makeNone();
        }
        return Value::makeBoolean(l.boolean || r.boolean);
    }
    printError("Unsupported operator");
    return Value::makeNone();
}

Value CallExpression::evaluate(Interpreter &interp, std::shared_ptr<Environment> env) {
    Value calleeVal = callee->evaluate(interp, env);
    std::vector<Value> evaluatedArgs;
    for (const auto &arg : args) {
        evaluatedArgs.push_back(arg->evaluate(interp, env));
    }
    return interp.callFunction(calleeVal, evaluatedArgs);
}

Value AttributeExpression::evaluate(Interpreter &interp, std::shared_ptr<Environment> env) {
    Value baseVal = base->evaluate(interp, env);
    return interp.getAttribute(baseVal, name);
}

Value IndexExpression::evaluate(Interpreter &interp, std::shared_ptr<Environment> env) {
    Value baseVal = base->evaluate(interp, env);
    Value idx = index->evaluate(interp, env);
    if (baseVal.kind == ValueKind::List || baseVal.kind == ValueKind::Tuple) {
        if (idx.kind != ValueKind::Number) {
            printError("Index must be number");
            return Value::makeNone();
        }
        int i = static_cast<int>(idx.number);
        const auto &seq = (baseVal.kind == ValueKind::List) ? baseVal.list : baseVal.tuple;
        if (i < 0 || i >= static_cast<int>(seq.size())) {
            printError("Index out of range");
            return Value::makeNone();
        }
        return seq[static_cast<size_t>(i)];
    }
    if (baseVal.kind == ValueKind::Dict) {
        if (idx.kind != ValueKind::Text) {
            printError("Dict key must be string");
            return Value::makeNone();
        }
        auto it = baseVal.dict.find(idx.text);
        if (it == baseVal.dict.end()) {
            printError("Missing dictionary key");
            return Value::makeNone();
        }
        return it->second;
    }
    printError("Indexing unsupported");
    return Value::makeNone();
}

Value DictExpression::evaluate(Interpreter &interp, std::shared_ptr<Environment> env) {
    std::map<std::string, Value> result;
    for (const auto &pair : pairs) {
        Value key = pair.first->evaluate(interp, env);
        if (key.kind != ValueKind::Text) {
            printError("Dictionary keys must be strings");
            continue;
        }
        Value value = pair.second->evaluate(interp, env);
        result[key.text] = value;
    }
    return Value::makeDict(result);
}

Value LambdaExpression::evaluate(Interpreter &interp, std::shared_ptr<Environment> env) {
    auto fn = std::make_shared<FunctionObject>();
    fn->parameters = params;
    fn->closure = env;
    fn->isLambda = true;
    auto retStmt = std::make_shared<ReturnStatement>(body);
    fn->body.push_back(retStmt);
    return Value::makeFunction(fn);
}

ExecutionResult AssignmentStatement::execute(Interpreter &interp, std::shared_ptr<Environment> env) {
    Value rhs = value->evaluate(interp, env);
    // Only support simple targets
    if (auto var = std::dynamic_pointer_cast<VariableExpression>(target)) {
        Value *slot = locateWithDeclarations(env, var->name);
        if (slot) {
            if (op == "=") {
                if (slot->kind != rhs.kind && slot->kind != ValueKind::None) {
                    printError("Type change not allowed for existing variable");
                    return {};
                }
                *slot = rhs;
            } else {
                std::string baseOp = op;
                if (!baseOp.empty() && baseOp.back() == '=') {
                    baseOp.pop_back();
                }
                BinaryExpression combiner(std::make_shared<LiteralExpression>(*slot), baseOp,
                                          std::make_shared<LiteralExpression>(rhs));
                *slot = combiner.evaluate(interp, env);
            }
        } else {
            if (op != "=") {
                printError("Augmented assignment requires existing variable");
                return {};
            }
            if (containsName(env->nonlocalsDeclared, var->name)) {
                printError("Nonlocal variable not found");
                return {};
            }
            if (containsName(env->globalsDeclared, var->name)) {
                auto root = findRootEnv(env);
                root->define(var->name, rhs);
            } else {
                env->define(var->name, rhs);
            }
        }
        return {};
    }
    if (auto attr = std::dynamic_pointer_cast<AttributeExpression>(target)) {
        Value base = attr->base->evaluate(interp, env);
        interp.setAttribute(base, attr->name, rhs);
        return {};
    }
    if (auto idx = std::dynamic_pointer_cast<IndexExpression>(target)) {
        Value idxVal = idx->index->evaluate(interp, env);
        if (auto baseVar = std::dynamic_pointer_cast<VariableExpression>(idx->base)) {
            Value *container = env->locate(baseVar->name);
            if (!container) {
                printError("Unknown container for index assignment");
                return {};
            }
            if (container->kind == ValueKind::List) {
                if (idxVal.kind != ValueKind::Number) {
                    printError("List index must be number");
                    return {};
                }
                int i = static_cast<int>(idxVal.number);
                if (i < 0 || i >= static_cast<int>(container->list.size())) {
                    printError("Index out of range");
                    return {};
                }
                if (rhs.kind != container->list[static_cast<size_t>(i)].kind) {
                    printError("Type mismatch on list assignment");
                    return {};
                }
                container->list[static_cast<size_t>(i)] = rhs;
                return {};
            }
            if (container->kind == ValueKind::Dict) {
                if (idxVal.kind != ValueKind::Text) {
                    printError("Dict key must be string");
                    return {};
                }
                if (!container->dict.empty()) {
                    auto it = container->dict.begin();
                    if (it->second.kind != rhs.kind) {
                        printError("Type mismatch on dict assignment");
                        return {};
                    }
                }
                container->dict[idxVal.text] = rhs;
                return {};
            }
            printError("Index assignment only supports list or dict");
            return {};
        }
        if (auto attrBase = std::dynamic_pointer_cast<AttributeExpression>(idx->base)) {
            Value inst = attrBase->base->evaluate(interp, env);
            Value container = interp.getAttribute(inst, attrBase->name);
            if (container.kind == ValueKind::List) {
                if (idxVal.kind != ValueKind::Number) {
                    printError("List index must be number");
                    return {};
                }
                int i = static_cast<int>(idxVal.number);
                if (i < 0 || i >= static_cast<int>(container.list.size())) {
                    printError("Index out of range");
                    return {};
                }
                if (rhs.kind != container.list[static_cast<size_t>(i)].kind) {
                    printError("Type mismatch on list assignment");
                    return {};
                }
                container.list[static_cast<size_t>(i)] = rhs;
                interp.setAttribute(inst, attrBase->name, container);
                return {};
            }
            if (container.kind == ValueKind::Dict) {
                if (idxVal.kind != ValueKind::Text) {
                    printError("Dict key must be string");
                    return {};
                }
                container.dict[idxVal.text] = rhs;
                interp.setAttribute(inst, attrBase->name, container);
                return {};
            }
        }
        printError("Unsupported assignment target");
        return {};
    }
    printError("Invalid assignment target");
    return {};
}

ExecutionResult IfStatement::execute(Interpreter &interp, std::shared_ptr<Environment> env) {
    Value cond = condition->evaluate(interp, env);
    bool truthy = false;
    if (cond.kind == ValueKind::Boolean) truthy = cond.boolean;
    else if (cond.kind == ValueKind::Number) truthy = cond.number != 0;
    else truthy = false;
    if (truthy) {
        return interp.executeBlock(thenBranch, env);
    }
    return interp.executeBlock(elseBranch, env);
}

ExecutionResult WhileStatement::execute(Interpreter &interp, std::shared_ptr<Environment> env) {
    while (true) {
        Value cond = condition->evaluate(interp, env);
        bool truthy = false;
        if (cond.kind == ValueKind::Boolean) truthy = cond.boolean;
        else if (cond.kind == ValueKind::Number) truthy = cond.number != 0;
        else truthy = false;
        if (!truthy) break;
        ExecutionResult res = interp.executeBlock(body, env);
        if (res.hasReturn || res.hasException) return res;
        if (res.breakLoop) break;
        if (res.continueLoop) continue;
    }
    return {};
}

ExecutionResult ForStatement::execute(Interpreter &interp, std::shared_ptr<Environment> env) {
    Value iter = iterable->evaluate(interp, env);
    std::vector<Value> items;
    if (iter.kind == ValueKind::List) items = iter.list;
    else if (iter.kind == ValueKind::Tuple) items = iter.tuple;
    else if (iter.kind == ValueKind::Set) items = iter.setItems;
    else if (iter.kind == ValueKind::Dict) {
        for (const auto &pair : iter.dict) {
            items.push_back(Value::makeText(pair.first));
        }
    } else if (iter.kind == ValueKind::Text) {
        for (char c : iter.text) {
            items.push_back(Value::makeText(std::string(1, c)));
        }
    } else if (iter.kind == ValueKind::Number && iter.number >= 0) {
        for (int i = 0; i < static_cast<int>(iter.number); ++i) {
            items.push_back(Value::makeNumber(i));
        }
    } else {
        printError("Object not iterable");
    }

    for (const auto &item : items) {
        AssignmentStatement assign(target, "=", std::make_shared<LiteralExpression>(item));
        assign.execute(interp, env);
        ExecutionResult res = interp.executeBlock(body, env);
        if (res.hasException || res.hasReturn) return res;
        if (res.breakLoop) return {};
        if (res.continueLoop) continue;
    }
    if (!elseBody.empty()) {
        return interp.executeBlock(elseBody, env);
    }
    return {};
}

ExecutionResult TryStatement::execute(Interpreter &interp, std::shared_ptr<Environment> env) {
    ExecutionResult tryRes = interp.executeBlock(tryBody, env);
    if (tryRes.hasException && !exceptBody.empty()) {
        if (!exceptionName.empty()) {
            env->define(exceptionName, tryRes.exceptionValue);
        }
        tryRes = interp.executeBlock(exceptBody, env);
    }
    if (!finallyBody.empty()) {
        ExecutionResult finalRes = interp.executeBlock(finallyBody, env);
        if (finalRes.hasReturn || finalRes.hasException || finalRes.breakLoop || finalRes.continueLoop) {
            return finalRes;
        }
    }
    return tryRes;
}

ExecutionResult WithStatement::execute(Interpreter &interp, std::shared_ptr<Environment> env) {
    Value ctx = contextExpr->evaluate(interp, env);
    Value enterVal = ctx;
    Value exitCallable = Value::makeNone();
    bool hasExit = false;
    Value enterAttr = interp.getAttribute(ctx, "__enter__");
    if (enterAttr.kind == ValueKind::Function) {
        enterVal = interp.callFunction(enterAttr, {});
    }
    Value exitAttr = interp.getAttribute(ctx, "__exit__");
    if (exitAttr.kind == ValueKind::Function) {
        exitCallable = exitAttr;
        hasExit = true;
    }
    if (!alias.empty()) {
        env->define(alias, enterVal);
    }
    ExecutionResult res = interp.executeBlock(body, env);
    if (hasExit) {
        std::vector<Value> exitArgs;
        if (res.hasException) {
            exitArgs.push_back(res.exceptionValue);
        }
        Value suppress = interp.callFunction(exitCallable, exitArgs);
        if (res.hasException && suppress.kind == ValueKind::Boolean && suppress.boolean) {
            res.hasException = false;
        }
    }
    return res;
}

ExecutionResult FunctionDefStatement::execute(Interpreter &, std::shared_ptr<Environment> env) {
    auto fn = std::make_shared<FunctionObject>();
    fn->parameters = params;
    fn->body = body;
    fn->closure = env;
    env->define(name, Value::makeFunction(fn));
    return {};
}

ExecutionResult ClassDefStatement::execute(Interpreter &interp, std::shared_ptr<Environment> env) {
    auto cls = std::make_shared<ClassObject>();
    cls->name = name;
    // Methods already populate env; create temporary child environment
    auto classEnv = std::make_shared<Environment>(env);
    for (const auto &stmt : body) {
        stmt->execute(interp, classEnv);
    }
    for (const auto &pair : classEnv->values) {
        if (pair.second.kind == ValueKind::Function) {
            cls->methods[pair.first] = pair.second;
        }
    }
    env->define(name, Value::makeClass(cls));
    return {};
}

Value Interpreter::callFunction(const Value &callable, const std::vector<Value> &args) {
    if (callable.kind == ValueKind::Function) {
        auto fn = callable.function;
        if (fn->body.size() == 1 && fn->body[0] == nullptr) {
            auto it = gBuiltinBodies.find(fn.get());
            if (it != gBuiltinBodies.end()) {
                return it->second(args);
            }
            printError("Unknown builtin");
            return Value::makeNone();
        }
        auto local = std::make_shared<Environment>(fn->closure);
        size_t argIndex = 0;
        bool hasBoundSelf = fn->closure && fn->closure->hasLocal("self");
        for (size_t i = 0; i < fn->parameters.size(); ++i) {
            const std::string &paramName = fn->parameters[i];
            if (hasBoundSelf && i == 0 && paramName == "self") {
                continue;
            }
            if (argIndex >= args.size()) {
                printError("Argument count mismatch");
                return Value::makeNone();
            }
            local->define(paramName, args[argIndex]);
            ++argIndex;
        }
        if (argIndex != args.size()) {
            printError("Argument count mismatch");
            return Value::makeNone();
        }
        ExecutionResult res = executeBlock(fn->body, local);
        if (res.hasReturn) {
            return res.returnValue;
        }
        return Value::makeNone();
    }
    if (callable.kind == ValueKind::Class) {
        auto inst = std::make_shared<InstanceObject>();
        inst->klass = callable.classType;
        Value instanceVal = Value::makeInstance(inst);
        auto it = callable.classType->methods.find("__init__");
        if (it != callable.classType->methods.end()) {
            auto initFn = it->second;
            auto bound = initFn.function;
            auto local = std::make_shared<Environment>(bound->closure);
            local->define("self", instanceVal);
            size_t argIndex = 0;
            for (size_t i = 0; i < bound->parameters.size(); ++i) {
                const std::string &paramName = bound->parameters[i];
                if (paramName == "self") {
                    continue;
                }
                if (argIndex >= args.size()) {
                    printError("__init__ argument mismatch");
                    break;
                }
                local->define(paramName, args[argIndex]);
                ++argIndex;
            }
            if (argIndex == args.size()) {
                executeBlock(bound->body, local);
            } else {
                printError("__init__ argument mismatch");
            }
        }
        return instanceVal;
    }
    printError("Object not callable");
    return Value::makeNone();
}

Value Interpreter::getAttribute(const Value &base, const std::string &name) {
    if (base.kind == ValueKind::Instance) {
        auto it = base.instance->fields.find(name);
        if (it != base.instance->fields.end()) {
            return it->second;
        }
        auto classIt = base.instance->klass->methods.find(name);
        if (classIt != base.instance->klass->methods.end()) {
            auto methodFn = classIt->second;
            auto bound = std::make_shared<FunctionObject>(*methodFn.function);
            bound->closure = std::make_shared<Environment>(methodFn.function->closure);
            bound->closure->define("self", base);
            return Value::makeFunction(bound);
        }
    }
    if (base.kind == ValueKind::Class) {
        auto it = base.classType->methods.find(name);
        if (it != base.classType->methods.end()) {
            return it->second;
        }
    }
    printError("Missing attribute");
    return Value::makeNone();
}

bool Interpreter::setAttribute(Value &base, const std::string &name, const Value &value) {
    if (base.kind == ValueKind::Instance) {
        base.instance->fields[name] = value;
        return true;
    }
    printError("Cannot set attribute on non-instance");
    return false;
}

} // namespace typthon

