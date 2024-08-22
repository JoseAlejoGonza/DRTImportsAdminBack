const database = require("../database/database")

async function validatelogin(login){
    let isCorrect = '';
    const connection = await database.getConnection();
    let queryUser = `SELECT ua.alias FROM user_admin ua WHERE ua.alias = '${login.userName}';`
    const [rowsUser, fieldsUser] = await connection.query(queryUser);
    if(rowsUser && rowsUser.length > 0){
        let query = `SELECT ua.alias, pu.password FROM user_admin ua JOIN password_usr_admin pu ON pu.user_admin_id = ua.id WHERE ua.alias = '${login.userName}' AND pu.password = '${login.password}';`
        const [rows, fields] = await connection.query(query);
        if(rows && rows.length > 0){
            isCorrect = 'login_successful';
        }else{
            isCorrect = 'wrong_password';
        }
    }else{
        isCorrect = 'wrong_user';
    }
    return isCorrect;
};

module.exports = {
    validatelogin
}