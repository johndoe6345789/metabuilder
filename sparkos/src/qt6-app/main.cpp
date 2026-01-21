/*
 * SparkOS Qt6 GUI Application
 * Direct kernel interface - bypassing Unix conventions
 * Network-first, GUI-only operating system
 */

#include <QApplication>
#include <QWidget>
#include <QLabel>
#include <QVBoxLayout>
#include <QPushButton>
#include <QFont>
#include <QScreen>
#include <QStyle>
#include <QProcess>
#include <QTextEdit>
#include <QFile>
#include <QIODevice>

class SparkOSMainWindow : public QWidget {
    Q_OBJECT

public:
    SparkOSMainWindow(QWidget *parent = nullptr) : QWidget(parent) {
        setupUI();
    }

private slots:
    void showSystemInfo() {
        // Direct kernel interface through /proc and /sys
        QString info = "SparkOS - Direct Kernel Interface\n";
        info += "==================================\n\n";
        
        // Read kernel version directly from /proc
        QFile kernelFile("/proc/version");
        if (kernelFile.open(QIODevice::ReadOnly)) {
            info += "Kernel: " + QString(kernelFile.readLine()).trimmed() + "\n\n";
            kernelFile.close();
        }
        
        // Read memory info directly from /proc
        QFile meminfoFile("/proc/meminfo");
        if (meminfoFile.open(QIODevice::ReadOnly)) {
            info += "Memory Info:\n";
            int lineCount = 0;
            while (!meminfoFile.atEnd() && lineCount < 3) {
                info += "  " + QString(meminfoFile.readLine()).trimmed() + "\n";
                lineCount++;
            }
            meminfoFile.close();
        }
        
        info += "\n";
        info += "Architecture: Network-First OS\n";
        info += "No Unix user/group system\n";
        info += "Direct Qt6 GUI to Kernel interface\n";
        
        QTextEdit *infoDialog = new QTextEdit();
        infoDialog->setReadOnly(true);
        infoDialog->setPlainText(info);
        infoDialog->setWindowTitle("System Information");
        infoDialog->resize(600, 400);
        infoDialog->show();
    }

private:
    void setupUI() {
        // Set window properties
        setWindowTitle("SparkOS");
        
        // Create main layout
        QVBoxLayout *mainLayout = new QVBoxLayout(this);
        mainLayout->setAlignment(Qt::AlignCenter);
        mainLayout->setSpacing(30);
        
        // Create welcome label
        QLabel *titleLabel = new QLabel("Welcome to SparkOS", this);
        QFont titleFont;
        titleFont.setPointSize(48);
        titleFont.setBold(true);
        titleLabel->setFont(titleFont);
        titleLabel->setAlignment(Qt::AlignCenter);
        titleLabel->setStyleSheet("color: #2196F3;");
        
        // Create subtitle label
        QLabel *subtitleLabel = new QLabel("Direct Kernel • Network-First • No Unix", this);
        QFont subtitleFont;
        subtitleFont.setPointSize(24);
        subtitleLabel->setFont(subtitleFont);
        subtitleLabel->setAlignment(Qt::AlignCenter);
        subtitleLabel->setStyleSheet("color: #666;");
        
        // Create status label
        QLabel *statusLabel = new QLabel("✓ System Initialized • GUI Active", this);
        QFont statusFont;
        statusFont.setPointSize(16);
        statusLabel->setFont(statusFont);
        statusLabel->setAlignment(Qt::AlignCenter);
        statusLabel->setStyleSheet("color: #4CAF50;");
        
        // Create info label
        QLabel *infoLabel = new QLabel("Qt6 GUI ↔ Linux Kernel (Direct Interface)", this);
        QFont infoFont;
        infoFont.setPointSize(14);
        infoLabel->setFont(infoFont);
        infoLabel->setAlignment(Qt::AlignCenter);
        infoLabel->setStyleSheet("color: #999;");
        
        // Create system info button
        QPushButton *infoButton = new QPushButton("System Info", this);
        infoButton->setMinimumSize(200, 60);
        QFont buttonFont;
        buttonFont.setPointSize(16);
        infoButton->setFont(buttonFont);
        infoButton->setStyleSheet(
            "QPushButton {"
            "  background-color: #2196F3;"
            "  color: white;"
            "  border: none;"
            "  border-radius: 5px;"
            "  padding: 10px;"
            "}"
            "QPushButton:hover {"
            "  background-color: #1976D2;"
            "}"
            "QPushButton:pressed {"
            "  background-color: #0D47A1;"
            "}"
        );
        connect(infoButton, &QPushButton::clicked, this, &SparkOSMainWindow::showSystemInfo);
        
        // Create exit button
        QPushButton *exitButton = new QPushButton("Power Off", this);
        exitButton->setMinimumSize(200, 60);
        exitButton->setFont(buttonFont);
        exitButton->setStyleSheet(
            "QPushButton {"
            "  background-color: #f44336;"
            "  color: white;"
            "  border: none;"
            "  border-radius: 5px;"
            "  padding: 10px;"
            "}"
            "QPushButton:hover {"
            "  background-color: #da190b;"
            "}"
            "QPushButton:pressed {"
            "  background-color: #a31408;"
            "}"
        );
        
        // Connect exit button
        connect(exitButton, &QPushButton::clicked, this, &QApplication::quit);
        
        // Add widgets to layout
        mainLayout->addStretch();
        mainLayout->addWidget(titleLabel);
        mainLayout->addWidget(subtitleLabel);
        mainLayout->addSpacing(40);
        mainLayout->addWidget(statusLabel);
        mainLayout->addWidget(infoLabel);
        mainLayout->addSpacing(40);
        mainLayout->addWidget(infoButton, 0, Qt::AlignCenter);
        mainLayout->addWidget(exitButton, 0, Qt::AlignCenter);
        mainLayout->addStretch();
        
        // Set background color
        setStyleSheet("QWidget { background-color: #f5f5f5; }");
        
        // Make fullscreen on Linux
        showFullScreen();
    }
};

int main(int argc, char *argv[]) {
    // Direct framebuffer rendering - no X11/Wayland server needed
    // The Qt application interfaces directly with the Linux kernel framebuffer
    qputenv("QT_QPA_PLATFORM", "linuxfb");
    
    QApplication app(argc, argv);
    
    SparkOSMainWindow window;
    window.show();
    
    return app.exec();
}

#include "main.moc"
