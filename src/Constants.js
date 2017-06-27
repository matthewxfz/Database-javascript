/**
 * Created by matthewxfz on 6/26/17.
 */
var Constants = {
    //sm
    PAGE_SIZE:4096,
    CODING:'utf8',
    //RM
    RID:8,
    slotSize:2,
    //schema
    schemaRecordLength:80,
    NaN:-1,

    //layout
    rootdir:'/JSDB',
    schemasdir:'/JSDB/schemas/',
    tablesdir:'/JSDB/tables/',
    viewsdir:'/JSDB/views/',
    index:'/JSDB/index/',
    disctionary:'/catalog',
    dictionaryBPLength:10

}

module.exports = Constants;