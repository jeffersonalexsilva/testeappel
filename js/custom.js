jQuery(document).ready(function(){
	var db;
	abrir_banco();
	jQuery('div.bar-percent a.description').on('click',function(e){
		get_goals();	
		e.preventDefault();
	});
	
	jQuery('a.icon-user').on('click',function(e){
		jQuery("section#person").removeClass('hide');	
		e.preventDefault();
	});
	
	jQuery('button#bt_registrameta').on('click',function(e){
		console.log('Start to save');
		var post = JSON.parse(JSON.stringify(jQuery('form#form-goal').serializeArray()));
		var id_goal = localStorage.getItem('idgoal');
		//monunt json structure
		var _date = post[5].value.split('/');
		_date = new Date(_date[2],_date[1],_date[0],'23','59','59','00');
		var goal = {
				id:id_goal,
				title:post[0].value,
				category:post[1].value,
				description:post[2].value,
				qt_repeat:parseInt(post[3].value),
				when:post[4].value,
				until:_date.getTime(),
				data_register: new Date().getTime(),
				last_change: new Date().getTime(),
				qt_realized:0
					}
		localStorage.setItem('idgoal', ++id_goal);
		console.log('Cadastro: '+goal.title);
		//save
		save_goal(goal);
		e.preventDefault();
	});
	
	jQuery('div.bar-percent a.active-percent').on('click',function(e){
    	var id = jQuery(this).data('goalid');
    	jQuery('article.id-'+id).addClass('show');
    	e.preventDefault();
    });
    jQuery('nav.nav-header ul.menu-goal li.item-menu a.return').on('click',function(e){
    	var id = jQuery(this).data('goalid');
    	jQuery('article.id-'+id).removeClass('show');
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
		//calculaMetaGlobal();
	};
	
	request.onupgradeneeded = function(event) {
		  var db = event.target.result;
		  var objectStore = db.createObjectStore("goals", {keyPath: 'id', autoIncrement: true}); 
		  localStorage.setItem('idgoal', '0');
		  localStorage.setItem('metaglobal', '0');
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
		get_goals();
		jQuery('section#painel-newgoal').toggleClass('show');
	};
}

function update_goal(){
	
}

function get_goals(){
	var all_content = [];
	var tx = db.transaction(["goals"], "readonly");
	var store = tx.objectStore("goals");
    var request = store.openCursor();
    request.onsuccess = function(event) {
    	var cursor = event.target.result;
		if (cursor) {
			all_content.push(cursor.value);
			cursor.continue();
		}
		var res = all_content.map(retornaString).join(' ');
		jQuery('ul#list-goals').html(res);
		//aumenta as barras de status
		var percent_global = 0;
		var interacao = 0;
		jQuery("span.bar").each(function(index) {
			percent_global = percent_global + parseInt(jQuery(this).data('percent'));
			interacao++;
			jQuery(this).css('width',jQuery(this).data('percent')+'%');
			/*console.log(percent_global);
			console.log(interacao);*/
		});
	    /*console.log(interacao);
	    console.log('Total: '+percent_global);*/
	    console.log('Total: '+percent_global/interacao);
	    jQuery('img.img-award-month').attr('src','img/award-'+calculaMedalha(percent_global/interacao)+'.svg');
	    jQuery('aside.abstract-list-goal .bar-percent > span.bar').css('width',percent_global/interacao);
	    jQuery('aside.abstract-list-goal .bar-percent > a span.qt-total').html(percent_global/interacao);
	    jQuery("section#person").addClass('hide');
	    //console.log(res);
    };
}

function retornaString(goal, index){
	var minute = 1000 * 60;
	var hour = minute * 60;
	var day = hour * 24;
	var t = Math.round((new Date().getTime() - goal.last_change)/minute);
	var qt_tempo = (t > 60)?Math.round(t/60)+' hora(s)':t+' minuto(s)';
	//calcula a quantidade de interações restantes para dar a porcentagem
	//quantidade de dias até o final, contando da data de registro
	var dataLimite = Math.round((goal.until - goal.data_register)/day);
	var qt_necessario = 0;
	switch(goal.when){
		case 'hora':{qt_necessario = parseInt(goal.qt_repeat)* (dataLimite*24); break}
		case 'dia':{qt_necessario = parseInt(goal.qt_repeat)* dataLimite;break}
		case 'semana':{qt_necessario = parseInt(goal.qt_repeat)* Math.round(dataLimite/7);break}
		case 'mes':{qt_necessario = parseInt(goal.qt_repeat)* Math.round(dataLimite/30);break}
		default:{break}
	}
	var porcentagem_realizada = parseInt((goal.qt_realized/qt_necessario)*100);
	 return `<li class="item-goal">
		<article class="content-item id-${goal.id}">
			<header>
				<nav class="nav-header">
					<ul class="menu-goal">
						<li class="item-menu"><a class="arrow return" onclick="closeGoal(${goal.id})" data-goalid="${goal.id}"><img src="img/circle-down.svg"></a></li>
					</ul>
				</nav>
				<div class="img-category ${goal.category}"></div>
				<h4 class="title-item">${goal.title}</h4>
				<figure class="img-award">
					<img src="img/award-${calculaMedalha(porcentagem_realizada)}.svg">
				</figure>
			</header>
			<div class="entry">
				<div class="entry-content">
					<h5>Decrição da meta</h5>
					<p>${goal.description}</p>
					<em class="cta">Já realizou essa atividade hoje?</em>
				</div>
				<button class="bt-item active" ${(porcentagem_realizada == 100)?'disabled':''} onclick="putGoal(${goal.id})" data-goalid="${goal.id}">${(porcentagem_realizada == 100)?'Concluída':'Registrar!'}</button> <span class="last-change">último registro<br/>cerca de ${qt_tempo}</span>
				<aside class="humour">
					<ul class="group-humour">
						<li>
							<input type="radio" class="rd-humour" name="humour" value="ok" id="rd-humour-ok${goal.id}">
							<label for="rd-humour-ok${goal.id}" class="lb"><img src="img/grin.svg"></label>
						</li>
						<li>
							<input type="radio" class="rd-humour" name="humour" value="happy" id="rd-humour-happy${goal.id}">
							<label for="rd-humour-happy${goal.id}" class="lb"><img src="img/smile.svg"></label>
						</li>
						<li>
							<input type="radio" class="rd-humour" name="humour" value="ok" id="rd-humour-neutral${goal.id}">
							<label for="rd-humour-neutral${goal.id}" class="lb"><img src="img/neutral.svg"></label>
						</li>
						<li>
							<input type="radio" class="rd-humour" name="humour" value="sad" id="rd-humour-sad${goal.id}">
							<label for="rd-humour-sad${goal.id}" class="lb"><img src="img/sad.svg"></label>
						</li>
						<li>
							<input type="radio" class="rd-humour" name="humour" value="angry" id="rd-humour-angry${goal.id}">
							<label for="rd-humour-angry${goal.id}" class="lb"><img src="img/angry.svg"></label>
						</li>								
					</ul>
					<strong>Como está seu humor hoje?</strong>
				</aside>
			</div>
			<footer class="foot-item">
				<div class="bar-percent">
					<span class="bar" data-percent="${porcentagem_realizada}"></span>
					<a href="#" onclick="openGoal(${goal.id})" class="active-percent" data-goalid="${goal.id}"><span class="num">${porcentagem_realizada}</span><span class="simbol">%</span></a>
				</div>
			</footer>
		</article>
	</li>`;
};

function calculaMedalha(porcentagem_realizada){
	var coin_goal = 0;//medalha de iniciante
	//comparações para dar a medalha para a faixa do usuário
	if(porcentagem_realizada == 100){
		coin_goal = 4;
	}else if (porcentagem_realizada > 59) {
		coin_goal = 3;		
	}else if (porcentagem_realizada > 39) {
		coin_goal = 2;		
	}else if (porcentagem_realizada > 19) {
		coin_goal = 1;		
	}
	return coin_goal;
}

function openGoal(data){
	jQuery('article.id-'+data).addClass('show');
}
function closeGoal(data){
	jQuery('article.id-'+data).removeClass('show');
}
function putGoal(data){
	var objectStore = db.transaction(["goals"],"readwrite").objectStore("goals");
	var request = objectStore.get(`${data}`);
	
	request.onerror = function(event) {
		console.log(event)
	};
	request.onsuccess = function(event) {
	  // Obter os valores antigos
	  var goal = request.result;
	 ++goal.qt_realized;
		
	  // Atulizar esse dado no banco
	  var requestUpdate = objectStore.put(request.result);
	   requestUpdate.onerror = function(event) {
	     console.log(event);
	   };
	   requestUpdate.onsuccess = function(event) {
	     console.log('Atualizado');
	     get_goals();
	   };
	};
}

function calculaMetaGlobal(){
	var all_content = [];
	var tx = db.transaction(["goals"], "readonly");
	var store = tx.objectStore("goals");
    var request = store.openCursor();
    var total = 0;
    request.onsuccess = function(event) {
    	var cursor = event.target.result;
		if (cursor) {
			all_content.push(cursor.value);
			total = total + aux_calculometa(cursor.value);
			console.log(calculaMedalha(total/all_content.lenght));
			cursor.continue();
		}
		jQuery('img-award-month').attr('src','img/award-'+calculaMedalha(total/all_content.lenght)+'.svg');
    };
}

function aux_calculometa(goal){
	var minute = 1000 * 60;
	var hour = minute * 60;
	var day = hour * 24;
	var qt_necessario = 0;
	//quantidade de dias até o final, contando da data de registro
	var dataLimite = Math.round((goal.until - goal.data_register)/day);
	switch(goal.when){
		case 'hora':{qt_necessario = parseInt(goal.qt_repeat)* (dataLimite*24); break}
		case 'dia':{qt_necessario = parseInt(goal.qt_repeat)* dataLimite;break}
		case 'semana':{qt_necessario = parseInt(goal.qt_repeat)* Math.round(dataLimite/7);break}
		case 'mes':{qt_necessario = parseInt(goal.qt_repeat)* Math.round(dataLimite/30);break}
		default:{break}
	}
	//incrementa o valor total
	return parseInt((goal.qt_realized/qt_necessario)*100);
}

function verificaStorage(){
	if (typeof(Storage) !== "undefined") {
		return true;
	}
	return false;
}

function adicionaItem(chave, valor){
	
}
