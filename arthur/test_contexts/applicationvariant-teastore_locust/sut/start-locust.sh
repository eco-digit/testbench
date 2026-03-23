#!/bin/sh
#
# https://github.com/eco-digit/project-docu/blob/main/docs/measurement_concepts/validation.md
######################################################################

###
### defining variables and cleaning up the environment, just in case
###
LEVELS=$1
TEASTORE_BASEDIR=$2
USERS=$3
TEASTORE_BRANCH=$4
TEASTORE_URL=$5
ITERATIONS=$6
TEASTORE_REPO="https://github.com/DescartesResearch/TeaStore"

###
### default values set to the variables (input parameters, in this order)
###
###     * LEVELS=10
###     * TEASTORE_BASEDIR=$HOME/teastore
###     * USERS=100
###     * TEASTORE_BRANCH=v1.4.2
###     * TEASTORE_URL=http://127.0.0.1:8080/tools.descartes.teastore.webui/
###     * ITERATIONS=10
###

# exit if first parameter is not a number, set the value of LEVELS if that is true
[ -z $1 ] && LEVELS=10 || LEVELS=$1
case $LEVELS in
    ''|*[!0-9]*) exit 1 ;;
    *) ;;
esac

# check second parameter, and set TEASTORE_BASEDIR
[ -z $2 ] && TEASTORE_BASEDIR="$HOME/teastore" || TEASTORE_BASEDIR=$2
TEASTORE_BASEDIR=$(readlink -f $TEASTORE_BASEDIR)

# exit if 3rd parameter is not a number, set the value of USERS if that is true
[ -z $3 ] && USERS=100 || USERS=$3
case $USERS in
    ''|*[!0-9]*) exit 1 ;;
    *) ;;
esac

# check forth parameter and set the TEASTORE_BRANCH
[ -z $4 ] && TEASTORE_BRANCH="v1.4.2" || TEASTORE_BRANCH=$4

# check last (5th) parameter, and set TEASTORE_URL
[ -z $5 ] && TEASTORE_URL="http://127.0.0.1:8080/tools.descartes.teastore.webui/" || TEASTORE_URL=$5

# exit if ITERATIONS is not a number, set the value of ITERATIONS if that is true
[ -z $6 ] && ITERATIONS=10 || ITERATIONS=$6
case $ITERATIONS in
    ''|*[!0-9]*) exit 1 ;;
    *) ;;
esac

# cleanup basedir and terminate any locust process
killall locust 2>/dev/null
rm -fr ${TEASTORE_BASEDIR} 2>/dev/null

# from here on, all the rest of the script runs from that directory as basedir
# git clone teastore's repository and start working from there
mkdir -p  ${TEASTORE_BASEDIR} 2>/dev/null
#git clone --quiet --single-branch \
#    -c advice.detachedHead=false \
#    --depth=1 --branch=${TEASTORE_BRANCH} \
#    ${TEASTORE_REPO} ${TEASTORE_BASEDIR}
mkdir -p  ${TEASTORE_BASEDIR}/examples/locust 2>/dev/null
cd ${TEASTORE_BASEDIR}/examples/locust
wget "${TEASTORE_REPO}/raw/refs/tags/${TEASTORE_BRANCH}/examples/locust/locustfile.py" 2>/dev/null
# opt to use FastHttpUser, based on https://docs.locust.io/en/stable/increase-performance.html
sed -Ei "s/\ HttpUser/\ FastHttpUser/g; s/\(HttpUser/\(FastHttpUser/g" locustfile.py 2>/dev/null

# delay the start of our tests - ensure all containers/applications are up
sleep 10
######################################################################

# t=0, starting the script and getting a timestamp of it
TIMESTAMP="${TEASTORE_BASEDIR}/examples/locust/TIMESTAMP"
echo -n "" >${TIMESTAMP}
date +%s  >>${TIMESTAMP}

### starting the load levels (hold period)
###
###     * the first load level starts 10 users (evey new level adds up 10 new users to be created);
###     * locust start its workers that will be spawing all necessary number of users;
###     * every second a new user is added to the requests queue;
###     * each user will be executing a number of "$ITERATIONS" against the "$TEASTORE_URL" previously defined;
###     * the requets will happen in parallel as soon as the workers spawn the second user;
###     * requests start as soon as the first user is created;
###     * once all requests from all users finish we enter the cooldown period (waiting 5 minutes);
###     * when the cooldown is done, we start the next load level.
###

# we interact the number of load level we would like to achieve -- each increment adds up 10 users to the next level
users_per_level=10
itera_per_level=$ITERATIONS
for l in `seq 1 ${LEVELS}`; do
    # check if we have more than the max users allowed
    if [ $users_per_level -gt $USERS ]; then
        echo "max number of users reached. exiting."
        exit 1
    fi
    echo "level=$l users=$users_per_level iterations=$itera_per_level"
    echo "`date +%s` LOAD LEVEL ${l} BEGIN"  >>${TIMESTAMP}

    # making logfile name prettier to sort the log files out, creating an index if l<10 (THIS IS NOT DIRECTLY RELATED TO THE LEVEL/WORKER)
    wi=""
    [ ${l} -lt 10 ] && wi="0${l}" || wi="${l}"

    # starting locust
    locust --headless \
      --host ${TEASTORE_URL} \
      --iterations $itera_per_level \
      --logfile "${TEASTORE_BASEDIR}/examples/locust/locust_L${wi}.log" \
      --spawn-rate 1 \
      --users $users_per_level \
      UserBehavior

    # cooldown period
    echo "cooldown 5"
    sleep 5
    #
    #     * inside a loop, we check how old the last log file is;
    #     * should that be older than 5 minutes we get out of the loop
    #
    # cooldown=0
    # touch "${TEASTORE_BASEDIR}/examples/locust/locust_L${wi}.log"
    # while [ $cooldown -lt 300 ]; do
    #   now=$(date +%s)
    #   age=$(date +%s -r "${TEASTORE_BASEDIR}/examples/locust/locust_L${wi}.log")
    #   cooldown=$(( $now - $age ))
    #   sleep 1
    # done

    # add 10 to the number of users we start on the next level
    users_per_level=$(( $users_per_level + 10 ))
    itera_per_level=$(( $itera_per_level * 2 ))

    echo "`date +%s` LOAD LEVEL ${l} END"  >>${TIMESTAMP}
done

# finished everything; register timestamp and exit
date +%s >>${TIMESTAMP}
exit 0
