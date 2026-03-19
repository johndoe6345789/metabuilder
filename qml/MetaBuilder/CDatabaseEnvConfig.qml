import QtQuick
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: envConfig
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
        anchors.fill: parent; anchors.margins: 16; spacing: 12
        CText { variant: "subtitle1"; text: "Environment Configuration" }
        CTextField { label: "DATABASE_URL"; text: envConfig.databaseUrl
        onTextChanged: databaseUrlEdited(text)
        placeholderText: "sqlite:///path/to/db or postgres://user:pass@host/db"
        Layout.fillWidth: true }
        CTextField { label: "DBAL_CACHE_URL (Redis)"; text: envConfig.cacheUrl
        onTextChanged: cacheUrlEdited(text)
        placeholderText: "redis://localhost:6379/0?ttl=300&pattern=read-through"
        Layout.fillWidth: true }
        CTextField { label: "DBAL_SEARCH_URL (Elasticsearch)"
        text: envConfig.searchUrl; onTextChanged: searchUrlEdited(text)
        placeholderText: "http://localhost:9200?index=dbal_search&refresh=true"
        Layout.fillWidth: true }
        CDivider { Layout.fillWidth: true }
        CAdapterPatternSelector { selectedPattern: envConfig.selectedPattern
        onPatternChanged: function(index) { envConfig.patternChanged(index) } }
        Item { height: 16 }
    }
}
