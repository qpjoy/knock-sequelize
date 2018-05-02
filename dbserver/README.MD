npm i sequelize sequelize-cli  pg@6 pg-hstore -S
sequelize init
sequelize db:create todos-dev
sequelize model:create --name Todo --attributes title:string
sequelize model:create --name TodoItem --attributes content:string,complete:boolean
sequelize db:migrate


// 备份还原数据库
sequelize-auto -o "./models" -d db -h localhost -u postgres -p 5432 -x admin -e postgres


./node_modules/.bin/sequelize-auto -o "./dbserver/im_export/sq_models" -t core_ruleng_model -s faast -d ORION_BS -h 172.21.138.21 -u postgres -p 5432 -x admin -e postgres
sequelize-auto -o "./sq_models" -t core_ruleng_fact -s faast -d CRONOS_CRISIS -h 172.21.138.21 -u postgres -p 5432 -x admin -e postgres



sequelize model:create --name Todo2 --attributes "title:string, complete:boolean,UserId:integer"

db:migrate和models.sync()存在不同，手动校验model和migration





sequelize db:create intern_site
sequelize model:create --name user --attributes uuid:uuid,name:string,email:string,mobile:string,sex:string,age:string,career:string
sequelize db:migrate
sequelize db:migrate:undo:all


sequelize model:create --name user_2 --attributes uuid:uuid,name:string,email:string,mobile:string,sex:string,age:str
ing,career:string,is_admin:int,status:string



associates
one2one:
