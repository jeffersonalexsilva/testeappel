function getList(goals){
	var content = `<li class="item-goal">
		<article class="content-item id-${goal.id}">
			<header>
				<nav class="nav-header">
					<ul class="menu-goal">
						<li class="item-menu"><a class="arrow return" data-goalid="${goal.id}"><img src="img/circle-down.svg"></a></li>
					</ul>
				</nav>
				<div class="img-category exercise"></div>
				<h4 class="title-item">${goal.title}</h4>
				<figure class="img-award">
					<img src="img/award-2.svg">
				</figure>
			</header>
			<div class="entry">
				<div class="entry-content">
					<h5>Decrição da meta</h5>
					<p>${goal.description}</p>
					<em class="cta">Já realizou essa atividade hoje?</em>
				</div>
				<button class="bt-item active" data-goalid="${goal.id}">Feito!</button> <span class="last-change">último registro à </span>
				<aside class="humour">
					<ul class="group-humour">
						<li>
							<input type="radio" class="rd-humour" name="humour" value="ok" id="rd-humour-ok">
							<label for="rd-humour-ok" class="lb"><img src="img/grin.svg"></label>
						</li>
						<li>
							<input type="radio" class="rd-humour" name="humour" value="happy" id="rd-humour-happy">
							<label for="rd-humour-happy" class="lb"><img src="img/smile.svg"></label>
						</li>
						<li>
							<input type="radio" class="rd-humour" name="humour" value="ok" id="rd-humour-neutral">
							<label for="rd-humour-neutral" class="lb"><img src="img/neutral.svg"></label>
						</li>
						<li>
							<input type="radio" class="rd-humour" name="humour" value="sad" id="rd-humour-sad">
							<label for="rd-humour-sad" class="lb"><img src="img/sad.svg"></label>
						</li>
						<li>
							<input type="radio" class="rd-humour" name="humour" value="angry" id="rd-humour-angry">
							<label for="rd-humour-angry" class="lb"><img src="img/angry.svg"></label>
						</li>								
					</ul>
					<strong>Como está seu humor hoje?</strong>
				</aside>
			</div>
			<footer class="foot-item">
				<div class="bar-percent" data-percent="${goal.qt_realized / 30 * 100}"><a href="#" class="active-percent" data-goalid="${goal.id}"><span class="num">${goal.qt_realized / 30 *100}</span><span class="simbol">%</span></a></div>
			</footer>
		</article>
	</li>`;
	}

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

    jQuery('.foot-item .bar-percent').each(function(index){
        jQuery(this).after().css('width',jQuery(this).data('percent'));
        });

    jQuery('button.bt-item').on('click',function(e){
    	var objectStore = db.transaction(["goals"], "readwrite").objectStore("goals");
    	var request = objectStore.get(jQuery(this).data('goalid'));
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
    	e.preventDefault();
    });
    