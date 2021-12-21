module.exports = (model, id) => {
    return new Promise((resolve, reject) => {
        console.log("llego este modelo: ", model);
        console.log("llego este id: ", id);
        resolve(true);
        // model.findOne({
        //     _id: id
        // }, (err, result) => {
        //     if (result) {
        //         return resolve(true);
        //     } else return reject(new Error(`FK Constraint 'checkObjectsExists' for '${id.toString()}' failed`));
        // });
    });
};