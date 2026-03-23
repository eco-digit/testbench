FROM ubuntu:24.04

#sudo is a workaround until we don't call sudo anymore; check if we still need qemu/libvirt-daemon after virsh refactor
RUN apt update && \
    apt install -y \
    qemu-kvm libvirt-daemon-system \
    sshpass git sudo \
    python3-pip python3-venv \
    libvirt-dev && \
    rm -rf /var/lib/apt/lists/*
#RUN apt update && \
#    apt install -y python3-libvirt libvirt-dev
#    pkg-config libvirt-clients && \

WORKDIR /arthur/app

COPY app/requirements.txt ./

RUN python3 -m venv .venv && \
    .venv/bin/pip install -r requirements.txt

COPY app/ .
COPY machines/ /arthur/machines
COPY test_contexts/ /arthur/test_contexts
RUN mkdir /arthur/logs && touch /arthur/logs/measurementqueue.log && touch /arthur/logs/process_measurement.log
#RUN mv /arthur/app/vnets_jobs_preset /arthur/app/vnets_jobs
EXPOSE 5000

ENTRYPOINT ["/arthur/app/.venv/bin/python3", "app.py"]