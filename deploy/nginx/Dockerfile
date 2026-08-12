# Reverse proxy fronting the Next.js app and the DBAL daemon on one origin.
#
# Same origin is not a convenience here, it is the contract: the app's
# NEXT_PUBLIC_DBAL_API_URL is baked at build time (frontends/nextjs/Dockerfile)
# to the relative path /api/dbal, so the browser resolves DBAL against whatever
# host served the page. Pointing the browser at DBAL directly would need a
# rebuilt bundle, not a runtime variable.
FROM nginx:alpine

COPY deploy/nginx/local-stack.conf /etc/nginx/nginx.conf

# Fails the build rather than the deployment if the config is malformed.
RUN nginx -t

EXPOSE 80
