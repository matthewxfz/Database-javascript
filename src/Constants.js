/**
 * Created by matthewxfz on 6/26/17.
 */
var Constants = {
    workdir:__dirname,
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
    catalog:'/JSDB/catalog',
    catalogBPLength:10,
    catalogStra:0,//FIFO
    defaultStra:0, //FIFO
    defaultBPSize:20

}

module.exports = Constants;