var oTable = {};
var local_config = {};
var default_config = {
        //"bPaginate": true, // Arrows for pagination
        "sPaginationType": "postpagination", // Numbers for pagination
        "bAutoWidth": false, // Column width
        "iDisplayLength" : 20, // Count of lines on one page
        "bLengthChange": false, // Possibility to select the number of lines per page
        "sDom": '<"top g-clearfix"f>t<"bottom"i<br/>lp><"clear">', // Arrangement of controls
        "oLanguage": {
            "sSearch": "",
            "sSearchPlaceholder": "Search all columns",
            "sLengthMenu": "Display _MENU_ records per page",
            "sZeroRecords": "Nothing found - sorry",
            "sInfo": "Showing _START_ to _END_ of _TOTAL_ records",
            "sInfoEmtpy": "Showing 0 to 0 of 0 records",
            "sInfoFiltered": ""
        },
        /* Server side processing */
        "bProcessing": true,
        "bServerSide": true,
        /* Save Last State */
        "bStateSave": true,

        /* Initial sorting by Position */
        "aaSorting": [[0, 'asc']],
        "fnServerData":function(sSource, aoData, fnCallback) {
            aoData.push({"name": "name", "value": 'value'});
            aoDatagl = aoData;
                $.ajax({
                        "dataType": 'json',
                        "type": "GET",
                        "url": sSource,
                        "data": aoData,
                        "success": function (data) {
                            manual_actions(data);
                            fnCallback.call(this, data)
                        }
                    });
        },
        "fnRowCallback": function(nRow, aData, iDisplayIndex) {
            $('td:eq(0)', nRow).html('' + aData[0] + '');
            $('td:eq(1)', nRow).html('' + aData[1] + '');
            return nRow;
        },
        "fnDrawCallback": function(oSettings) {
            //callback_func();
        }
    }

function postpagination(){
    //$('head').append('<style>#frm_list_processing:before {content:"Processing"}</style>'); //Remove this and change css
    $.fn.dataTableExt.oPagination.postpagination = {
    "fnInit": function ( oSettings, nPaging, fnCallbackDraw )
    {
        var nFirst = document.createElement( 'a' );
        var nPrevious = document.createElement( 'a' );
        var nNext = document.createElement( 'a' );
        var nLast = document.createElement( 'a' );
        var nInput = document.createElement( 'input' );
        var nPage = document.createElement( 'span' );
        var nOf = document.createElement( 'span' );
        nFirst.innerHTML = oSettings.oLanguage.oPaginate.sFirst;
        nPrevious.innerHTML = oSettings.oLanguage.oPaginate.sPrevious;
        nNext.innerHTML = oSettings.oLanguage.oPaginate.sNext;
        nLast.innerHTML = oSettings.oLanguage.oPaginate.sLast;
          
        nFirst.className = "b-tablePaginate__link";
        nPrevious.className = "b-tablePaginate__arrow -type_prev";
        nNext.className="b-tablePaginate__arrow -type_next";
        nLast.className = "b-tablePaginate__link";
        nOf.className = "b-tablePaginate__number";
        nPage.className = "b-tablePaginate__number";
        nInput.className = "form-control b-inputPagStyle b-tablePaginate__input";
          
        if ( oSettings.sTableId !== '' )
        {
            nPaging.setAttribute( 'id', oSettings.sTableId+'_paginate' );
            nPrevious.setAttribute( 'id', oSettings.sTableId+'_previous' );
            nPrevious.setAttribute( 'id', oSettings.sTableId+'_previous' );
            nNext.setAttribute( 'id', oSettings.sTableId+'_next' );
            nLast.setAttribute( 'id', oSettings.sTableId+'_last' );
        }
          
        nInput.type = "text";
        nInput.style.width = "50px";
        nInput.style.display = "inline-block";
        nPage.innerHTML = "Page ";
          
        nPaging.appendChild( nFirst );
        nPaging.appendChild( nInput );
        nPaging.appendChild( nOf );
        nPaging.appendChild( nPage );
        nPaging.appendChild( nPrevious );
        nPaging.appendChild( nNext );
        nPaging.appendChild( nLast );
          
        $(nFirst).click( function () {
            oSettings.oApi._fnPageChange( oSettings, "first" );
            fnCallbackDraw( oSettings );
        } );
          
        $(nPrevious).click( function() {
            oSettings.oApi._fnPageChange( oSettings, "previous" );
            fnCallbackDraw( oSettings );
        } );
          
        $(nNext).click( function() {
            oSettings.oApi._fnPageChange( oSettings, "next" );
            fnCallbackDraw( oSettings );
        } );
          
        $(nLast).click( function() {
            oSettings.oApi._fnPageChange( oSettings, "last" );
            fnCallbackDraw( oSettings );
        } );
        $(nInput).keypress(function(e){if(e.which == 13 ) setpage.call(this, e)});
        $(nInput).blur(setpage);
        function setpage(e) {
            this.value = parseInt(this.value);
            if ( e.which == 38 || e.which == 39 )
            {
                this.value++;
            }
            else if ( (e.which == 37 || e.which == 40) && this.value > 1 )
            {
                this.value--;
            }
              
            if ( this.value == "" || this.value.match(/[^0-9]/) )
            {
                this.value = 1;
                /* Nothing entered or non-numeric character */
                //return;
            }
              
            var iNewStart = oSettings._iDisplayLength * (this.value - 1);
            if ( iNewStart > oSettings.fnRecordsDisplay() )
            {
                /* Display overrun */
                oSettings._iDisplayStart = (Math.ceil((oSettings.fnRecordsDisplay()-1) /
                    oSettings._iDisplayLength)-1) * oSettings._iDisplayLength;
                fnCallbackDraw( oSettings );
                return;
            }
              
            oSettings._iDisplayStart = iNewStart;
            fnCallbackDraw( oSettings );
        }   
          
        /* Take the brutal approach to cancelling text selection */
        $('span', nPaging).bind( 'mousedown', function () { return false; } );
        $('span', nPaging).bind( 'selectstart', function () { return false; } );
    },    
    "fnUpdate": function ( oSettings, fnCallbackDraw )
    {
        
        //var oSettings = oTable.fnSettings();
        /* Show an example parameter from the settings */
        $("#frm_list_processing").hide();
        $("#frm_list_info").css({"visibility":"hidden"});
        var aoData;
        if(typeof(aoDatagl)!='undefined') 
            aoData = aoDatagl;         
        else 
            aoData = oTable._fnAjaxParameters( oSettings.aoData );          
        if(pagepostpagination){        
        aoData.push({"name":"cnt", "value":"true"});
        $.ajax({
            "dataType": 'json',
            "type": "GET",
            "async":false,
            "url": oSettings.sAjaxSource,
            "data": aoData,
            success: function(data){
                        oSettings.iTotalDisplayRecords  = data;
                        oSettings._iRecordsDisplay = data;  
                        oTable._fnUpdateInfo(oSettings);
                }
            });
        }
        if ( !oSettings.aanFeatures.p )
        {
            return;
        }
        var iPages = Math.ceil((oSettings.fnRecordsDisplay()) / oSettings._iDisplayLength);
        var iCurrentPage = Math.ceil(oSettings._iDisplayStart / oSettings._iDisplayLength) + 1;

        /* Loop over each instance of the pager */
        var an = oSettings.aanFeatures.p;
        for ( var i=0, iLen=an.length ; i<iLen ; i++ )
        {
            var spans = an[i].getElementsByTagName('span');
            var inputs = an[i].getElementsByTagName('input');
            spans[1].innerHTML = " of "+iPages + " pages"
            //onkeyup = 'this.value=parseInt(this.value) | 0'
            inputs[0].value = iCurrentPage;
        }
        $("#frm_list_info").css({"visibility":"visible"});
        $(".dataTables_info").addClass('b-tablePageRec');
        $(".dataTables_filter input").addClass('form-control');
        $(".b-contentTable input[type = 'text']").addClass("form-control b-inputTbStyle"); 
        //setTimeout(function() {
            //$(".b-contentTable select").addClass("b-selectStyle").styler();
            //$(".b-contentTable input[type = 'checkbox']").addClass("b-checkStyle").styler();
        //}, 500);
        hideShowText();
}
};  
}
$(document).ready(function(){
    var config =  $.extend(default_config, local_config);
    postpagination();
    
    /* DataTable initialization */
    oTable = $("#frm_list").dataTable(config);

    /* Append individual search */
    $("#tfoot_search_fields").insertAfter("#main_table_tr");

    /* Append rangesearch DIV to top DIV*/
    $("#rangesearch").appendTo(".top");
    
    $("thead input").focus( function () {
        if ( $(this).hasClass("search_init") )
        {
            this.value = "";
        }
    } );
    $("thead input.search_init").keypress(function(e){if(e.which == 13 ) $(this).blur();});
    $("thead input.search_init").blur( function () {
        /* Filter on the column (the index) of this element */
        //if(this.value.length >= 3){
            oTable.fnFilter( this.value, $("thead input.search_init").index(this) );
        //}
    });
    $(".dataTables_filter input").unbind();
    $(".dataTables_filter input").keypress(function(e){if(e.which == 13 ) $(this).blur();});
    $(".dataTables_filter input").blur(function(){oTable.fnFilter( this.value);});
    /*oTable.on( 'draw.dt', function () { 
            $(".dataTables_filter input").unbind();
            $(".dataTables_filter input").keypress(function(e){if(e.which == 13 ) $(this).blur();});
            $(".dataTables_filter input").blur(function(){oTable.fnFilter( this.value);});
            console.log($._data($('.dataTables_filter input').get(0), "events"));});*/
  });
function manual_actions(data){
    $("#timer").html(data['timeworked']).show();
};
function curPageReload() {
    var oSettings = oTable.fnSettings();
    var iCurrentPage = Math.ceil(oSettings._iDisplayStart / oSettings._iDisplayLength);
    oTable.fnPageChange(iCurrentPage);
}