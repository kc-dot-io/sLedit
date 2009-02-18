	///////////////////////////////////////////////////////////////////////////
	// init options - edit these for your purposes
	///////////////////////////////////////////////////////////////////////////
	window.addEvent('domready', function(){
		var sLeditOpts = { 
						  sLclass: '.sLedit', // editable class
						  ajaxUrl: '/ajax/update.php' // server side processing
						  }; var edit = new sLedit(sLeditOpts);
		});

	//////////////////////////////////////////////////////////////////////////	
	// Init TinyMce Editor
	//////////////////////////////////////////////////////////////////////////

	tinyMCE.init({
		mode: "none",
  		valid_elements : "*[*]",
		theme : "advanced",
        plugins : "table,iespell,safari,preview,fullscreen,spellchecker,pagebreak,advimage,advlink,searchreplace,visualchars,nonbreaking,xhtmlxtras",
        theme_advanced_buttons1 : "undo,redo,|,bold,italic,underline,separator,strikethrough,justifyleft,justifycenter,justifyright, justifyfull,bullist,numlist,link,unlink,|,image,|,code,|,fullscreen,preview",
        theme_advanced_buttons2 : "forecolor,charmap,|,fontselect,fontsizeselect",
        theme_advanced_buttons3 : "tablecontrols",
        theme_advanced_toolbar_location : "top",
        theme_advanced_toolbar_align : "left",
        theme_advanced_path_location : "bottom",
	   	extended_valid_elements : "a[name|href|target|title|onclick|class|rel|id],img[class|src|border|alt|title|hspace|vspace|width|height|align|onmouseover|onmouseout|name|style|rel],hr[class|width|size|noshade|id],font[face|size|color|style],span[class|align|style|id],div[rel|class|align|id>",
        file_browser_callback : "fileBrowserCallBack",
        paste_use_dialog : false,
        theme_advanced_resizing : true,
		forced_root_block : false,
        theme_advanced_resize_horizontal : true,
        apply_source_formatting : false,
        convert_urls : true,
        relative_urls : false,
        remove_script_host : true,
        auto_resize : false
    });

	/////////////////////////////////////////////////////////////////////////////	
	// Init TinyMce FileBrowser
	/////////////////////////////////////////////////////////////////////////////
	function fileBrowserCallBack(field_name, url, type, win) {
		var connector = "../../filemanager/browser.html?Connector=connectors/php/connector.php";
		var enableAutoTypeSelection = true;		
		var cType;
		tinymcpuk_field = field_name;
		tinymcpuk = win;
			switch (type) {
				case "image":
					cType = "Image";
					break;
				case "flash":
					cType = "Flash";
					break;
				case "file":
					cType = "File";
					break;
			}
			if (enableAutoTypeSelection && cType) {	connector += "&Type=" + cType;	}
			window.open(connector, "tinymcpuk", "modal,width=600,height=400");
		}	
	//////////////////////////////////////////////////////////////////////////////
	// class - no editing below this line
	//////////////////////////////////////////////////////////////////////////////
	var sLedit = new Class({
		   initialize:function(options){
				//constructors	
				this.setOptions(options);
				this.environment(options);
			},
			setOptions:function(options){
				// options
				this.options = Object.extend({ }, options || {} );
				// objects
				this.rel = {};
				this.params = {};
				this.container = {};
				this.content = {};
				this.txtID = {};
				this.textarea = {};
				this.saveDiv = {};
				this.cancel = {};
				this.span = {};
				this.save = {};
				this.response = {};
				this.pars = {};
				this.url = {};
			},
			hover:function(options, el, color){
			//////////////////////////////////////////////////////////////////////////	
			// editable hover tool tip with opacity on and off effect
			//////////////////////////////////////////////////////////////////////////			
			 	if($(el).alt) $(el).alt = 'click to edit this area';
				if(!$(el).title) $(el).title = 'click to edit this area';
			
			 	var myTips = new Tips( $$('.sLedit'), {
						maxTitleChars: 50,
						fixed: false,
						initialize: function(){
							this.fx = new Fx.Style(this.toolTip, 'opacity', {wait: false});
						},
						onHide: function(){
							this.fx.start(0);							
						},
						onShow: function(){
							this.fx.start(1);
						}
					});
			},
			getRel:function(options,el,i){
			//////////////////////////////////////////////////////////////////////////	
			// parseQuery wrapper for rel tags
			//////////////////////////////////////////////////////////////////////////				
				this.rel[i] = $(el).getProperty('rel');
				this.params[i] = this.parseQuery(options,this.rel[i].substr(5,999));
				return this.params[i];
			},
			environment: function(options,sLclass) {			
			//////////////////////////////////////////////////////////////////////////	
			// Constructor
			//////////////////////////////////////////////////////////////////////////			
				$$(options.sLclass).each(function(el,i) {
						$(el).setStyle('cursor','pointer');
							
						this.getRel(options,el,i);						
									  
						$(el).addEvent('mouseover', this.hover.pass([options, el, '#ffffcc'], this)	);
						$(el).addEvent('mouseout', this.hover.pass([options, el, '#ffffff'], this)	);

						if(this.rel[i].indexOf('textarea') > -1)
							$(el).addEvent('click',  this.editor.pass([options, el, i], this) );
						
						if(this.rel[i].indexOf('lightboxEditor') > -1)
							$(el).addEvent('click',  this.lighboxEditor.pass([options, el, i], this) );
	
						if(this.rel[i].indexOf('input') > -1)
							$(el).addEvent('click', this.input.pass([options, el, i], this) );
	
						if(this.rel[i].indexOf('image') > -1)
							$(el).addEvent('click', this.image.pass([options, el, i], this) );

				}.bind(this) );	
			},
			editor:function(options, el, i){
			//////////////////////////////////////////////////////////////////////////	
			// Editor condition: textarea with custom rows & cols
			//////////////////////////////////////////////////////////////////////////
				this.content[i] = $(el).innerHTML;
				this.container[i] = new Element('div').injectAfter(el);
				$(el).style.display = 'none';
					
				//check params are suitable or set base attributes / remove # from object
				if(this.params[i]['rows'] == undefined)	this.params[i]['rows'] = '15';
					//else this.params[i]['rows'] = this.params[i]['rows'].replace("#","");
				if(this.params[i]['cols'] == undefined) this.params[i]['cols'] = '65';
					//else this.params[i]['cols'] = this.params[i]['cols'].replace("#","");

				this.txtID[i] = 'mce_'+i;
						
				//textarea
				this.textarea[i] = new Element('textarea').injectInside(this.container[i]);
				this.textarea[i].value = this.content[i];
				this.textarea[i].addClass('mceEditor');
				this.textarea[i].setProperty('id', this.txtID[i]);
				this.textarea[i].setStyle('position','relative');										
				this.textarea[i].setProperties({
					rows: this.params[i]['rows'],
					cols: this.params[i]['cols']
					});
									
				//save + cancel div
				this.saveDiv[i] = new Element('div').injectInside(this.container[i]);
				this.saveDiv[i].setProperty('class', 'txtAreaSave');
															
				//cancel
				this.cancel[i] = new Element('a').injectInside(this.saveDiv[i]);
				this.cancel[i].setProperty('href', 'javascript:;');
				this.cancel[i].innerHTML = 'cancel';
					
				//seperator
				this.span[i] = new Element('span').injectAfter(this.cancel[i]);
				this.span[i].innerHTML = ' - ';
					
				//save
				this.save[i] = new Element('a').injectInside(this.saveDiv[i]);
				this.save[i].setProperty('href', 'javascript:;');
				this.save[i].innerHTML = 'save';

				//response
				this.response[i] = new Element('div').injectBefore(this.saveDiv[i]);
				this.response[i].setStyles({'width':'600px'});
				this.response[i].id = 'txtReponse';
				//////////////////////////////////////////////////////////////////////////	
				// Async data saving event function
				//////////////////////////////////////////////////////////////////////////
				this.save[i].addEvent('click', function() {
						unsetTextareaToTinyMCE(this.txtID[i]);
						$(el).style.display = 'block';
						
						$(el).innerHTML = this.textarea[i].value;

						this.pars[i] = 'module_type='+this.params[i]['module_type']
									+'&type_sid='+this.params[i]['type_sid']
									+'&sid='+this.params[i]['sid']
									+'&content='+escape(this.textarea[i].value);
				
						new Ajax( options.ajaxUrl, {
									 method: 'post',
									 postBody: this.pars[i],
									 update: $(this.response[i].id),
									 onComplete: function(){   
											var responseFade = new Fx.Style( $('txtReponse'), 'opacity', {
																				duration:3000, 
																				onComplete:function(){
																					$('txtReponse').remove();
																				}
																			});
											responseFade.start.pass([1,0],responseFade).delay(2000);
										}
									 }
									).request(); 								
				
						this.textarea[i].remove();
						this.save[i].remove();
						this.cancel[i].remove();
						this.span[i].remove();
						this.saveDiv[i].remove();
					}.bind(this) );
				
				this.cancel[i].addEvent('click', function() {
						unsetTextareaToTinyMCE(this.txtID[i]);
						$(el).style.display = 'block';
						this.textarea[i].remove();
						this.cancel[i].remove();
						this.save[i].remove();
						this.span[i].remove();
						this.saveDiv[i].remove();
					}.bind(this) );	
													  
				setTextareaToTinyMCE(this.txtID[i]);
			},
			lighboxEditor:function(options, el, i){
			//////////////////////////////////////////////////////////////////////////	
			// Lightbox Editor condition: textarea with custom rows & cols
			//////////////////////////////////////////////////////////////////////////
				var imgForm = new Element('form').setProperties({
							'action': options.ajaxUrl,
							'method': 'post',
							'id': 'changecontentform',
							'enctype':'multipart/form-data'
							});
							imgForm.setStyles({ 'text-align':'left' });
							//imgForm.innerHTML = this.container[i];
							imgForm.innerHTML = '<input type="hidden" id="module_type" name="module_type" value="skin_variable"/>'
										+'<input type="hidden" id="type_sid" name="type_sid" value="'+this.params[i]["type_sid"]+'"/>'
										+'<input type="hidden" id="sid" name="sid" value="'+this.params[i]["sid"]+'"/>';
					
				this.content[i] = $(el).innerHTML;
				this.container[i] = new Element('div').injectInside(imgForm);
				//$(el).style.display = 'none';
				
				//check params are suitable or set base attributes / remove # from object
				if(this.params[i]['rows'] == undefined)	this.params[i]['rows'] = '15';
				//else this.params[i]['rows'] = this.params[i]['rows'].replace("#","");
				if(this.params[i]['cols'] == undefined) this.params[i]['cols'] = '125';
				//else this.params[i]['cols'] = this.params[i]['cols'].replace("#","");
				this.txtID[i] = 'mce_'+i;
				//textarea
				this.textarea[i] = new Element('textarea').injectInside(this.container[i]);
				this.textarea[i].value = this.content[i];
				this.textarea[i].addClass('mceEditor');
				this.textarea[i].setProperty('id', this.txtID[i]);
				this.textarea[i].setProperty('name', 'chunk');
				this.textarea[i].setStyle('position','relative');										
				this.textarea[i].setProperties({
					rows: this.params[i]['rows'],
					cols: this.params[i]['cols']
				});
								
				//save + cancel div
				this.saveDiv[i] = new Element('div').injectInside(this.container[i]);
				this.saveDiv[i].setProperty('class', 'txtAreaSave');
														
				//cancel
				this.cancel[i] = new Element('a').injectInside(this.saveDiv[i]);
				this.cancel[i].setProperty('href', 'javascript:;');
				this.cancel[i].innerHTML = 'cancel';
				
				//seperator
				this.span[i] = new Element('span').injectAfter(this.cancel[i]);
				this.span[i].innerHTML = ' - ';
				
				//save
				this.save[i] = new Element('a').injectInside(this.saveDiv[i]);
				this.save[i].setProperty('href', 'javascript:;');
				this.save[i].innerHTML = 'save';
					//response
				this.response[i] = new Element('div').injectBefore(this.saveDiv[i]);
				this.response[i].setStyles({'width':'600px'});
				this.response[i].id = 'txtReponse';
				
				if( $$('.mceEditor').length > 0 ){
					var boxHtml = new MooPrompt('Error!', 'Please make sure you save your last edit session before starting another.', {
						buttons: 1,
						button1: 'ok'
						});
				}else{
					var boxHtml = new MooPrompt('Edit Text', imgForm, {
						buttons: 0,
						button1: 'Submit',
						button2: 'Cancel',
						width: 500,
						height: 400
						 });
				}
				
				//////////////////////////////////////////////////////////////////////////	
				// Async data saving event function
				//////////////////////////////////////////////////////////////////////////
				this.save[i].addEvent('click', function() {
					unsetTextareaToTinyMCE(this.txtID[i]);								
						$('changecontentform').submit();								
						this.textarea[i].remove();
						this.save[i].remove();
						this.cancel[i].remove();
						this.span[i].remove();
						this.saveDiv[i].remove();
					}.bind(this) );
				
				this.cancel[i].addEvent('click', function() {
						unsetTextareaToTinyMCE(this.txtID[i]);	
						boxHtml.close();
						this.textarea[i].remove();
						this.cancel[i].remove();
						this.save[i].remove();
						this.span[i].remove();
						this.saveDiv[i].remove();
					}.bind(this) );	
					setTextareaToTinyMCE(this.txtID[i]);
		},
		input:function(options, el, i){
		//////////////////////////////////////////////////////////////////////////	
		// Input Condition - loads content into input box
		//////////////////////////////////////////////////////////////////////////	
			$(el).style.display = 'none';
			this.content[i] = $(el).innerHTML;
			this.container[i] = new Element('div').injectAfter(el);
				
			//input
			this.textarea[i] = new Element('input').injectInside(this.container[i]);
			this.textarea[i].value = content;
			this.textarea[i].setProperty('size',5);

			//save + cancel div
			this.saveDiv[i] = new Element('span').injectInside(this.container[i]);
			this.saveDiv[i].setProperty('class', 'inputSave');
					
			//cancel
			this.cancel[i] = new Element('a').injectInside(this.saveDiv[i]);
			this.cancel[i].setProperty('href', 'javascript:;');
			this.cancel[i].innerHTML = 'x';
			
			//seperator
			this.span[i] = new Element('span').injectAfter(this.cancel[i]);
			this.span[i].innerHTML = ' - ';
			
			//save
			this.save[i] = new Element('a').injectInside(this.saveDiv[i]);
			this.save[i].setProperty('href', 'javascript:;');
			this.save[i].innerHTML = 's';
	
						
			this.save[i].addEvent('click', function() {
				$(el).style.display = 'block';
				$(el).innerHTML = this.textarea[i].value;
				/* new Ajax() */											
				this.textarea[i].remove();
				this.save[i].remove();
				this.cancel[i].remove();
				this.span[i].remove();
				this.saveDiv[i].remove();
			}.bind(this) );
						
			this.cancel[i].addEvent('click', function() {
				$(el).style.display = 'block';
				this.textarea[i].remove();
				this.cancel[i].remove();
				this.save[i].remove();
				this.span[i].remove();
				this.saveDiv[i].remove();
			}.bind(this) );		
		},
		image:function(options, el, i){
		//////////////////////////////////////////////////////////////////////////	
		// Image management function. MooPrompt dependant.
		//////////////////////////////////////////////////////////////////////////				
			$(el).style.cursor = 'pointer';
			if( $(el).getParent().getParent().href ) $(el).getParent().getParent().href = '#';
			if( $(el).getParent().href ) $(el).getParent().href = '#';
						
			var imgForm = new Element('form').setProperties({
					'action': options.ajaxUrl,
					'method': 'post',
					'id': 'newImageForm',
					'enctype':'multipart/form-data'
			});
			imgForm.setStyles({ 'text-align':'left' });
			imgForm.innerHTML = '<img src="'+$(el).src+'" alt="'+$(el).alt+'"/><br /><br />'
								+'<input type="hidden" id="module_type" name="module_type" value="skin_variable"/>'
								+'<input type="hidden" id="type_sid" name="type_sid" value="'+this.params[i]["type_sid"]+'"/>'
								+'<input type="hidden" id="sid" name="sid" value="'+this.params[i]["sid"]+'"/>'
								+'Alt Tag:<br /><input type="input" class="textField" id="alt" name="alt" value="'+$(el).alt+'" style="width:375px;"/><br /><br />'
								+'File to Upload:<br /><input type="file" class="textField" id="userimage" name="userimage"/><br /><br />';
						
			var boxHtml = new MooPrompt('Upload a New Image', imgForm, {
				buttons: 2,
				button1: 'Submit',
				button2: 'Cancel',
				width: 500,
				height: 400,
				onButton1: function() {
					if( $('userimage').value.length < 1 || 
						$('userimage').value.length > 0 && 
						$('userimage').value.indexOf('.jpg') > -1)	
						$('newImageForm').submit();
						else
							alert('Please only upload .jpg files');
					}
				 });
		},
		parseQuery:function(options,query){
		//////////////////////////////////////////////////////////////////////////	
		// parseQuery code borrowed from ibox borrowed from thickbox, Thanks Cody!
		// retrieve rel attributes with cols=x&rows=x
		//////////////////////////////////////////////////////////////////////////
			var Params = new Object ();
			   if (!query) return Params; 
			   var Pairs = query.split(/[;&]/);
			   for ( var i = 0; i < Pairs.length; i++ ) {
				  var KeyVal = Pairs[i].split('=');
				  if ( ! KeyVal || KeyVal.length != 2 ) continue;
				  var key = unescape( KeyVal[0] );
				  var val = unescape( KeyVal[1] );
				  val = val.replace(/\+/g, ' ');
				  Params[key] = val;
			   }		   
			   return Params;
		}
	});
		//////////////////////////////////////////////////////////////////////////	
		// TinyMCE helper functions
		//////////////////////////////////////////////////////////////////////////
			bTextareaWasTinyfied = false; //this should be global, could be stored in a cookie...
			function setTextareaToTinyMCE(sEditorID) {
				var oEditor = document.getElementById(sEditorID);
				if(oEditor && !bTextareaWasTinyfied) {
					tinyMCE.execCommand('mceAddControl', true, sEditorID);
					bTextareaWasTinyfied = true;
				}
				return;
			}
			function unsetTextareaToTinyMCE(sEditorID) {
				var oEditor = document.getElementById(sEditorID);
				if(oEditor && bTextareaWasTinyfied) {
					tinyMCE.execCommand('mceRemoveControl', true, sEditorID);
					bTextareaWasTinyfied = false;
					$(oEditor).removeClass('mceEditor');
				}
				return;
			}
	
