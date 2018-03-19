vs_source = null,
fs_source = null;

function loadshaders(vs,fs)
{

	$.ajax({
	    async: false,
	    url: vs,
	    success: function (data) 
	    {
		vs_source=data;
    	    },
    	    dataType: 'html'
	});

	$.ajax({
	    async: false,
    	    url: fs,
    	    success: function (data) 
    	    {
		fs_source=data;
    	    },
    	    dataType: 'html'
	});
}

