set /p "LOC=Enter folder to checkout:"
set /p "BRANCH=Enter branch to checkout:release/"

if not exist %LOC%\ (
mkdir %LOC%
)

set GIT_USERID=rajendra-ctl
set GIT_PWD=4d7e6d4968b1003fbc1e5d3dbf0c298c73e3875f
set BRANCH=release/%BRANCH%

cd %LOC%
git clone -b %BRANCH% https://%GIT_USERID%:%GIT_PWD%@github.com/CenturyLink/bmoc-common-process.git

git clone -b %BRANCH% https://%GIT_USERID%:%GIT_PWD%@github.com/CenturyLink/bmoc-order-process.git

git clone -b %BRANCH% https://%GIT_USERID%:%GIT_PWD%@github.com/CenturyLink/bmoc-order-process-mcd.git

git clone -b %BRANCH% https://%GIT_USERID%:%GIT_PWD%@github.com/CenturyLink/bmoc-order-process-misc.git

git clone -b %BRANCH% https://%GIT_USERID%:%GIT_PWD%@github.com/CenturyLink/bmoc-order-process-sup.git

git clone -b %BRANCH% https://%GIT_USERID%:%GIT_PWD%@github.com/CenturyLink/bmoc-pojo-module.git

git clone -b %BRANCH% https://%GIT_USERID%:%GIT_PWD%@github.com/CenturyLink/bmco-orchestrator-common-services.git


cd bmoc-pojo-module
call mvn clean install -DskipTests=true -Dmaven.test.skip=true -U -Dmaven.wagon.http.ssl.insecure=true -Dmaven.wagon.http.ssl.allowall=true
cd ..

cd bmoc-common-process
call mvn clean install -DskipTests=true -Dmaven.test.skip=true -U -Dmaven.wagon.http.ssl.insecure=true -Dmaven.wagon.http.ssl.allowall=true
cd ..


cd bmco-orchestrator-common-services
call mvn clean install -DskipTests=true -Dmaven.test.skip=true -U -Dmaven.wagon.http.ssl.insecure=true -Dmaven.wagon.http.ssl.allowall=true
cd ..


cd bmoc-order-process
call mvn clean install -DskipTests=true -Dmaven.test.skip=true -U -Dmaven.wagon.http.ssl.insecure=true -Dmaven.wagon.http.ssl.allowall=true
cd ..


cd bmoc-order-process-mcd
call mvn clean install -DskipTests=true -Dmaven.test.skip=true -U -Dmaven.wagon.http.ssl.insecure=true -Dmaven.wagon.http.ssl.allowall=true
cd ..


cd bmoc-order-process-misc
call mvn clean install -DskipTests=true -Dmaven.test.skip=true -U -Dmaven.wagon.http.ssl.insecure=true -Dmaven.wagon.http.ssl.allowall=true
cd ..


cd bmoc-order-process-sup
call mvn clean install -DskipTests=true -Dmaven.test.skip=true -U -Dmaven.wagon.http.ssl.insecure=true -Dmaven.wagon.http.ssl.allowall=true
cd ..








