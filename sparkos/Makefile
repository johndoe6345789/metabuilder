# SparkOS Makefile
# Builds the minimal Linux distribution

CC = gcc
CFLAGS = -Wall -O2 -static
DESTDIR = rootfs
IMAGE = sparkos.img
IMAGE_SIZE = 512M

.PHONY: all clean init gui image image-docker help install docker-release

all: init gui

help:
	@echo "SparkOS Build System"
	@echo "===================="
	@echo "Targets:"
	@echo "  make init           - Build the init system"
	@echo "  make gui            - Build the Qt6 GUI application"
	@echo "  make all            - Build both init and GUI (default)"
	@echo "  make install        - Install init and GUI to rootfs"
	@echo "  make image          - Create bootable dd-able image (requires root)"
	@echo "  make image-docker   - Create bootable image using Docker (no root required)"
	@echo "  make docker-release - Build release package using Docker (no root required)"
	@echo "  make clean          - Clean build artifacts"
	@echo ""
	@echo "Note: Creating a bootable image requires root privileges"
	@echo "      and various tools (debootstrap, syslinux, etc.)"
	@echo ""
	@echo "For easier image building, use Docker:"
	@echo "      make image-docker"
	@echo "      OR: ./scripts/build-image.sh"

init: src/init.c
	@echo "Building SparkOS init system..."
	$(CC) $(CFLAGS) -o init src/init.c
	@echo "Init system built successfully: ./init"

gui:
	@echo "Building SparkOS Qt6 GUI application..."
	@mkdir -p build/gui
	@cd build/gui && cmake ../../src/qt6-app -DCMAKE_INSTALL_PREFIX=$(DESTDIR)/usr
	@cd build/gui && $(MAKE)
	@echo "Qt6 GUI application built successfully: build/gui/sparkos-gui"

install: init gui
	@echo "Installing init to rootfs..."
	install -D -m 755 init $(DESTDIR)/sbin/init
	@echo "Init installed to $(DESTDIR)/sbin/init"
	@echo "Installing Qt6 GUI application to rootfs..."
	@cd build/gui && $(MAKE) install
	@echo "GUI application installed to $(DESTDIR)/usr/bin/sparkos-gui"

image: install
	@echo "Creating bootable image..."
	@if [ "$$(id -u)" -ne 0 ]; then \
		echo "ERROR: Image creation requires root privileges"; \
		echo "Run: sudo make image"; \
		exit 1; \
	fi
	@./scripts/create_image.sh

image-docker:
	@echo "Building bootable image using Docker..."
	@./scripts/build-image.sh

docker-release:
	@echo "Building release package using Docker..."
	@./scripts/docker-release.sh

clean:
	@echo "Cleaning build artifacts..."
	rm -f init
	rm -f $(IMAGE)
	rm -rf build/
	rm -rf release/
	@echo "Clean complete"
