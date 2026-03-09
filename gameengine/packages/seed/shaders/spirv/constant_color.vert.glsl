#version 450

layout(location = 0) in vec3 a_position;
layout(location = 1) in vec4 a_color;

layout(push_constant) uniform PushConstants {
    mat4 u_modelViewProj;
};

layout(location = 0) out vec4 v_color;

void main() {
    gl_Position = u_modelViewProj * vec4(a_position, 1.0);
    v_color = a_color;
}
