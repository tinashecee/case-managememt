
function dut(a,b){
	if(b == true || b == 'true'){ 
		fetch('/change-lawfirm-status',{
			method: 'POST',
			body: JSON.stringify({
			  law_firm_id: a,
			  active_status: false
			}),
			headers: {
				'Content-type': 'application/json; charset=UTF-8'
			},
		})
	}else{
		fetch('/change-lawfirm-status',{
			method: 'POST',
			body: JSON.stringify({
				law_firm_id: a,
				active_status: true
			}),
			headers: {
				'Content-type': 'application/json; charset=UTF-8'
			},
		})

	}


}