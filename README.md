# start project in docker
    -> docker compose up ( To start container in docker )
    -> docker ps ( Lists running containers )
    -> docker start <container_name>
    -> docker stop <container_name>
    -> docker rm <container_name>
    -> docker run [options] image_name
        Options:-
            -d: Runs the container in detached mode (in the background). 
            -p <host_port>:<container_port>: Maps a port on the host machine to a port inside the container. 
            --name <container_name>: Assigns a name to the container. 
