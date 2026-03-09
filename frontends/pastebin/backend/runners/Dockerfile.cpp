FROM gcc:13

RUN apt-get update && apt-get install -y \
    cmake \
    ninja-build \
    python3-pip \
    python3-dev \
    && pip3 install --break-system-packages conan \
    && conan profile detect --force \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace
