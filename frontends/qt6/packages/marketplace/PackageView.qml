import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: root
    color: "transparent"

    property string activeCategory: "All"
    property string searchQuery: ""
    property int cartCount: 0
    property var cartItems: []

    property var categories: ["All", "Electronics", "Software", "Services"]

    property var products: [
        { name: "MetaBuilder Pro License", price: 49.99, rating: 5, category: "Software", color: Theme.primary },
        { name: "USB-C Hub Adapter", price: 29.95, rating: 4, category: "Electronics", color: "#e67e22" },
        { name: "CI/CD Pipeline Setup", price: 199.00, rating: 5, category: "Services", color: "#2ecc71" },
        { name: "Mechanical Keyboard", price: 89.99, rating: 4, category: "Electronics", color: "#9b59b6" },
        { name: "Code Review Package", price: 75.00, rating: 3, category: "Services", color: "#e74c3c" },
        { name: "Dark Theme Extension", price: 4.99, rating: 5, category: "Software", color: "#34495e" }
    ]

    function filteredProducts() {
        var result = []
        for (var i = 0; i < products.length; i++) {
            var p = products[i]
            var matchCategory = activeCategory === "All" || p.category === activeCategory
            var matchSearch = searchQuery.length === 0 ||
                p.name.toLowerCase().indexOf(searchQuery.toLowerCase()) >= 0
            if (matchCategory && matchSearch) result.push(p)
        }
        return result
    }

    function addToCart(productName) {
        var items = cartItems.slice()
        items.push(productName)
        cartItems = items
        cartCount = items.length
    }

    function ratingStars(count) {
        var s = ""
        for (var i = 0; i < 5; i++) s += (i < count ? "\u2605" : "\u2606")
        return s
    }

    ScrollView {
        anchors.fill: parent
        anchors.margins: 20
        clip: true

        ColumnLayout {
            width: parent.width
            spacing: 16

            // ── Header ──
            CCard {
                Layout.fillWidth: true

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 20
                    spacing: 12

                    FlexRow {
                        Layout.fillWidth: true
                        spacing: 12

                        CText { variant: "h2"; text: "Marketplace" }
                        CBadge { text: products.length + " Products" }
                        Item { Layout.fillWidth: true }
                        CBadge { text: cartCount + " in Cart"; accent: cartCount > 0 }
                    }
                }
            }

            // ── Search bar ──
            CCard {
                Layout.fillWidth: true

                RowLayout {
                    anchors.fill: parent
                    anchors.margins: 16
                    spacing: 12

                    CTextField {
                        Layout.fillWidth: true
                        placeholderText: "Search products..."
                        text: root.searchQuery
                        onTextChanged: root.searchQuery = text
                    }
                }
            }

            // ── Category filter chips ──
            FlexRow {
                Layout.fillWidth: true
                spacing: 8

                Repeater {
                    model: root.categories
                    CChip {
                        text: modelData
                        selected: root.activeCategory === modelData
                        onClicked: root.activeCategory = modelData
                    }
                }
            }

            // ── Product Grid ──
            GridLayout {
                Layout.fillWidth: true
                columns: 3
                columnSpacing: 12
                rowSpacing: 12

                Repeater {
                    model: filteredProducts()

                    CCard {
                        Layout.fillWidth: true
                        Layout.preferredWidth: 200
                        Layout.preferredHeight: 260

                        ColumnLayout {
                            anchors.fill: parent
                            anchors.margins: 16
                            spacing: 10

                            // Image placeholder
                            Rectangle {
                                Layout.fillWidth: true
                                Layout.preferredHeight: 80
                                radius: 8
                                color: modelData.color
                                opacity: 0.85

                                CText {
                                    anchors.centerIn: parent
                                    variant: "h3"
                                    text: modelData.name.substring(0, 2).toUpperCase()
                                    color: "#ffffff"
                                }
                            }

                            CText {
                                variant: "subtitle1"
                                text: modelData.name
                                Layout.fillWidth: true
                                elide: Text.ElideRight
                            }

                            CText {
                                variant: "caption"
                                text: ratingStars(modelData.rating)
                                font.pixelSize: 16
                                color: "#f39c12"
                            }

                            FlexRow {
                                Layout.fillWidth: true
                                spacing: 8

                                CText {
                                    variant: "h3"
                                    text: "$" + modelData.price.toFixed(2)
                                    color: Theme.primary
                                }

                                Item { Layout.fillWidth: true }

                                CChip { text: modelData.category }
                            }

                            CButton {
                                text: "Add to Cart"
                                Layout.fillWidth: true
                                onClicked: root.addToCart(modelData.name)
                            }
                        }
                    }
                }
            }

            // ── Cart summary ──
            CCard {
                Layout.fillWidth: true
                visible: cartCount > 0

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 16
                    spacing: 8

                    FlexRow {
                        Layout.fillWidth: true
                        spacing: 8

                        CText { variant: "h3"; text: "Cart Summary" }
                        CBadge { text: cartCount + " items"; accent: true }
                        Item { Layout.fillWidth: true }
                        CButton {
                            text: "Clear Cart"
                            variant: "ghost"
                            size: "sm"
                            onClicked: { root.cartItems = []; root.cartCount = 0 }
                        }
                    }

                    CDivider { Layout.fillWidth: true }

                    Repeater {
                        model: root.cartItems
                        CText { variant: "body2"; text: "\u2022 " + modelData }
                    }

                    CDivider { Layout.fillWidth: true }

                    CButton {
                        text: "Checkout"
                        Layout.fillWidth: true
                    }
                }
            }
        }
    }
}
