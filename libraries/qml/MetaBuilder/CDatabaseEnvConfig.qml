import QtQuick
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: envConfig
    objectName: "card_database_env_config"
    Accessible.role: Accessible.Pane
    Accessible.name: "Environment Configuration"
    Layout.fillWidth: true

    property string databaseUrl: ""
    property string cacheUrl: ""
    property string searchUrl: ""
    property int selectedPattern: 0

    signal databaseUrlEdited(string value)
    signal cacheUrlEdited(string value)
    signal searchUrlEdited(string value)
    signal patternChanged(int index)

    ColumnLayout {
        Layout.fillWidth: true; spacing: 12
        CText { variant: "subtitle1"; text: "Environment Configuration" }
        CTextField { label: "DATABASE_URL"
        text: envConfig.databaseUrl
        onTextChanged: databaseUrlEdited(text)
        placeholderText:
            "sqlite:///path/to/db or postgres://user:pass@host/db"
        Layout.fillWidth: true
        activeFocusOnTab: true
        Accessible.role: Accessible.EditableText
        Accessible.name: "DATABASE_URL"
        Accessible.description: "Primary database connection URL" }
        CTextField { label: "DBAL_CACHE_URL (Redis)"
        text: envConfig.cacheUrl
        onTextChanged: cacheUrlEdited(text)
        placeholderText:
            "redis://localhost:6379/0?ttl=300&pattern=read-through"
        Layout.fillWidth: true
        activeFocusOnTab: true
        Accessible.role: Accessible.EditableText
        Accessible.name: "DBAL Cache URL"
        Accessible.description: "Redis cache connection URL" }
        CTextField { label: "DBAL_SEARCH_URL (Elasticsearch)"
        text: envConfig.searchUrl
        onTextChanged: searchUrlEdited(text)
        placeholderText:
            "http://localhost:9200?index=dbal_search&refresh=true"
        Layout.fillWidth: true
        activeFocusOnTab: true
        Accessible.role: Accessible.EditableText
        Accessible.name: "DBAL Search URL"
        Accessible.description: "Elasticsearch search service URL" }
        CDivider { Layout.fillWidth: true }
        CAdapterPatternSelector { selectedPattern: envConfig.selectedPattern
        onPatternChanged: function(index) { envConfig.patternChanged(index) } }
        Item { height: 16 }
    }
}
