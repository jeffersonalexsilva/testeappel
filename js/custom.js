jQuery(document).ready(function(){
	var db;
	abrir_banco();
	jQuery('div.bar-percent a.description').on('click',function(e){
		jQuery.get('html/goals.html', function(data){
			get_goals(data);	
			e.preventDefault();
		})
	});
	
	jQuery('a.icon-user').on('click',function(e){
		jQuery('section#content').html('');
		jQuery("section#person").removeClass('hide');	
		e.preventDefault();
	});
	
	jQuery('button#bt_registrameta').on('click',function(e){
		console.log('Start to save');
		var post = JSON.parse(JSON.stringify(jQuery('form#form-goal').serializeArray()));
		var id_goal = localStorage.getItem('idgoal');
		//monunt json structure
		var goal = {
				id:id_goal,
				title:post[0].value,
				category:post[1].value,
				description:post[2].value,
				qt_repeat:post[3].value,
				when:post[4].value,
				until:post[5].value,
				data_register: new Date().getTime(),
				last_change: new Date().getTime(),
				qt_realized:0
					}
		localStorage.setItem('idgoal', ++id_goal);
		console.log(goal);
		//save
		save_goal(goal);
		e.preventDefault();
	});
	
	

})

function abrir_banco(){
	var request = indexedDB.open("db_goals",1);
	request.onerror = function(event) {
		//erro no banco
	db.onerror = function(event) {
		alert("Erro no banco da dados Local: " + event.target.errorCode);
	};
	//erro no request
	  alert("Esse webapp usa IndexedDB. Você deve dar permissão para executar.");
	};
	//sucesso, retorna o request
	request.onsuccess = function(event) {
		db =  request.result;
		console.log('Banco criado/aberto com sucesso!');
	};
	
	request.onupgradeneeded = function(event) {
		  var db = event.target.result;
		  var objectStore = db.createObjectStore("goals", {keyPath: 'id', autoIncrement: true}); 
		  localStorage.setItem('idgoal', '0');
		};
}

function save_goal(_data){
	var transaction = db.transaction(["goals"], "readwrite");

	transaction.oncomplete = function(event) {
	  //alert("Pronto!");
	};

	transaction.onerror = function(event) {
	  // Não esquecer de tratar os erros!
		console.log(event);
	};

	var objectStore = transaction.objectStore("goals");
	//console.log(_data);
	var request = objectStore.put(_data);
	request.onsuccess = function(event) {
		alert('Cadastrado com sucesso!');
		jQuery('form#form-goal').trigger("reset");
		jQuery('section#painel-newgoal').toggleClass('show');
	};
}

function update_goal(){
	
}

function addDat(el){
	var objectStore = db.transaction(["goals"], "readwrite").objectStore("goals");
	var request = objectStore.get(le.data('goalid'));
	request.onerror = function(event) {
	 console.log(event);
	};
	request.onsuccess = function(event) {
	  // Obter os valores antigos
	  var data = request.result;
	  
	  ++data.qt_realized;
	  
	  // Atulizar esse dado no banco
	  var requestUpdate = objectStore.put(data);
	   requestUpdate.onerror = function(event) {
	     // Tratar erro
	   };
	   requestUpdate.onsuccess = function(event) {
	     console.log('atualizado');
	   };
	};
}

function get_goals(_data){
	var all_content = [];
	var tx = db.transaction(["goals"], "readonly");
	var store = tx.objectStore("goals");
    var request = store.openCursor();
    request.onsuccess = function(e) {
    	var cursor = event.target.result;
		if (cursor) {
			all_content.push(cursor.value);
			cursor.continue();
		}
    };
    //JSON.stringify(all_content)
	//return self.all_content;
    console.log(all_content);
    /*var data1 = [];

    data1 = JSON.stringify(all_content);
    console.log(data1);*/
    jQuery.post('html/list-goals.php',{data:JSON.stringify(all_content)},function(data){
		jQuery('section#content').html(_data);
    	jQuery('ul#list-goals').html(data);
    	jQuery("section#person").addClass('hide');
    });
}

function verificaStorage(){
	if (typeof(Storage) !== "undefined") {
		return true;
	}
	return false;
}

function adicionaItem(chave, valor){
	
}
