FROM nginx

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

COPY ./docker-nginx.conf /etc/nginx/conf.d/default.conf

# Add another ngix with ssl as reverse proxy
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]