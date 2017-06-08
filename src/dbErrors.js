class smError extends Error{
    constructor(message){
        this.message = message;
    }
}



smError.types = {
    file_not_found:"The file is not found",
    file_handle_not_init:"Fild handle not init",
    write_fail:"Write fail",
    read_fail:"Read fail",
    read_not_exist_page:"Read not exist page",
    page_number_out_of_boudary:"Page number is out of boundary",
    get_number_of_bytes_fail:"Get the number of bytes fail",
    
    
}
function rmError(message){
    this.message = message;
}

rmError.prototype = new Error();

rmError.types = {
    compare_value_of_different_data_type:"Comparing value of different data type",
    expected_value_is_not_boolean:"Expected_value_is_not_boolean",
    boolean_expected_value_is_not_boolean:"Boolean expr vlaue is not boolean",
    no_more_tuple:"There are no more tuple",
    no_print_for_datatype:"",
}

function imError(message){
    this.message = message;
}

imError.prototype = new Error();

imError.types = {
    key_not_found:"",
    key_already_exsit:"",
    N_too_large:"",
    no_more_entries:"",
}
module.exports = smError;
