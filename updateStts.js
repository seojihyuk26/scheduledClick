function updateStts(_brd_id, _seq, _data_stts){
    var append_str = "";
    if(_data_stts == "H") append_str = "미";
    if(confirm(append_str+"게시하시겠습니까?")){
        location.href="./updateSatus.do?brd_id="+_brd_id+"&seq="+_seq+"&data_stts="+_data_stts;
    }	
}