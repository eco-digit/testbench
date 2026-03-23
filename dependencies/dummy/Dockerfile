FROM alpine:3.20

RUN apk add --no-cache bash postgresql16-client curl

RUN curl -fsSL https://dl.min.io/client/mc/release/linux-amd64/mc -o /usr/local/bin/mc \
    && chmod +x /usr/local/bin/mc

WORKDIR /work

COPY restore/ /work/restore/
COPY entrypoint.sh /work/
RUN chmod +x /work/entrypoint.sh /work/restore/*.sh

VOLUME ["/data"]

ENTRYPOINT ["bash", "/work/entrypoint.sh"]