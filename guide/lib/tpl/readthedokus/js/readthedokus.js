function ReadtheDokus()
{

	this._currentPage;
	this._currentPageIndex;
	this._pages;
	this._toc = document.getElementById("dw__toc");
	this._header = document.querySelector("header");
	this._sidebar = document.querySelector("#dokuwiki__aside");
	this._delimiter = ( window.location.search.indexOf(":") > -1 ? ":" : "/");
	this._id = ( this._delimiter == ":" ? JSINFO["id"] : JSINFO["id"].split(":").join("/") );
	this._startPage = "";

}

ReadtheDokus.prototype.run = function()
{

	// Enum sidebar items to
	//   - embed toc in the corresponding sidebar item
	//   - collect all page links
	var isFound = false;
	this._pages = [];
	if (JSINFO["ACT"] == "show")
	{
		this._enumSidebarLinks(function(elem) {
			// Embed toc
			if (!isFound)
			{
				if (elem.href.indexOf(this._id) > -1)
				{
					this._embedToc(elem, this._toc);
					isFound = true;
				}
			}

			// Collect page links
			this._pages.push(elem.href);
		}.bind(this));
	}

	// Start page
	if (this._pages.length > 0)
	{
		this._startPage = this._getStartPage(this._pages[0], this._delimiter);
		this._pages.unshift(this._startPage);
		var list = document.querySelectorAll("#sidebarheader > div.home > a, #pageheader .breadcrumbs > .home > a");
		var nodes = Array.prototype.slice.call(list, 0);
		nodes.forEach(function(elem) {
			elem.href = this._startPage;
		}.bind(this));
	}

	// Show toc on top of sidebar if item was not found in sidebar
	if (!isFound && this._toc)
	{
		this._showToc(this._toc);
		this.showSidebar();
	}

	this._initToc(this._toc);
	this._initMobileHeader();
	this._initPageButtons();
	this._sidebar.querySelector("#sidebarheader #qsearch__in").setAttribute("placeholder", "Search docs");

	if (this._toc)
	{
		this._toc.scrollIntoView(true);
	}

};

ReadtheDokus.prototype.getMediaQuery = function(elem)
{

	return getComputedStyle(document.querySelector("#__media_query")).getPropertyValue("--media-query").trim() || getComputedStyle(document.querySelector("#__media_query"))["-media-query"].trim();

};

ReadtheDokus.prototype.toggleTocMenu = function(elem)
{

	var invisible = elem.parentNode.querySelector(".toc").classList.contains("invisible");
	if (invisible)
	{
		this.expandTocMenu(elem);
	}
	else
	{
		this.collapseTocMenu(elem);
	}

};

ReadtheDokus.prototype.expandTocMenu = function(elem, allChildren)
{

	if (elem && elem.classList.contains("expandable"))
	{
		elem.parentNode.querySelector(".toc").classList.remove("invisible");

		var i = elem.children[0].children[0].children[0];
		i.classList.remove("fa-plus-square");
		i.classList.add("fa-minus-square");

		var img = elem.children[0].children[0].children[1];
		img.classList.remove("plus");
		img.classList.add("minus");
		img.src= DOKU_BASE + "lib/images/minus.gif";
	}

};

ReadtheDokus.prototype.collapseTocMenu = function(elem, allChildren)
{

	if (elem && elem.classList.contains("expandable"))
	{
		elem.parentNode.querySelector(".toc").classList.add("invisible");

		var i = elem.children[0].children[0].children[0];
		i.classList.remove("fa-minus-square");
		i.classList.add("fa-plus-square");

		var img = elem.children[0].children[0].children[1];
		img.classList.remove("minus");
		img.classList.add("plus");
		img.src=DOKU_BASE + "lib/images/plus.gif";
	}

};

ReadtheDokus.prototype.toggleSidebar = function(elem)
{

	var mq = this.getMediaQuery();
	if (mq == "pc" || mq == "tb")
	{
		document.querySelector("#dokuwiki__site").classList.toggle("showSidebar");
	}
	else
	{
		document.querySelector("#dokuwiki__site").classList.toggle("showSidebarSP");
	}

};

ReadtheDokus.prototype.showSidebar = function(elem)
{

	var mq = this.getMediaQuery();
	if (mq == "pc" || mq == "tb")
	{
		document.querySelector("#dokuwiki__site").classList.add("showSidebar");
	}
	else
	{
		document.querySelector("#dokuwiki__site").classList.add("showSidebarSP");
	}

};

ReadtheDokus.prototype.hideSidebar = function(elem)
{

	if (dokus.getMediaQuery() == "pc" || dokus.getMediaQuery() == "tb")
	{
		document.querySelector("#dokuwiki__site").classList.remove("showSidebar");
	}
	else
	{
		document.querySelector("#dokuwiki__site").classList.remove("showSidebarSP");
	}

};


ReadtheDokus.prototype._enumSidebarLinks = function(callback)
{

	callback = ( typeof callback === "function" ? callback : function(){} );
	var links = this._sidebar.querySelectorAll(".aside > #sidebar > ul .level1 a");
	var nodes = Array.prototype.slice.call(links, 0);
	nodes.forEach(function(elem) {
		callback(elem);
	});

};

ReadtheDokus.prototype._getStartPage = function(basePage, delimiter)
{

	var result = "";

	if (basePage && delimiter)
	{
		var re = new RegExp("\\" + delimiter + "[^\\" + delimiter + "]*[^\\" + delimiter + "]*$");
		result = basePage.replace(re, "").replace(re, "") + delimiter + "start";

	}

	return result;

};

ReadtheDokus.prototype._embedToc = function(target, toc)
{

	if (target && toc)
	{
		target.parentNode.parentNode.appendChild(toc);
		target.parentNode.style.display = "none";
	}

};

ReadtheDokus.prototype._showToc = function(toc)
{

	if (toc)
	{
		this._toc.parentNode.style.display = "block";
	}

};

ReadtheDokus.prototype._initToc = function(toc)
{

	if (toc)
	{
		this._installTocSelectHandler();
		this._installTocMenuHandler();
		this._installTocJumpHandler();
	}

};

// Install click handler to highlight and expand toc menu
ReadtheDokus.prototype._installTocSelectHandler = function()
{

	var list = this._toc.querySelectorAll(".level1 div.li");
	var nodes = Array.prototype.slice.call(list, 0);
	nodes.forEach(function(elem) {
		elem.addEventListener("click", function() {
			// Get level2 parent
			let p = this._getParent(elem, "level2");

			// Remove all current
			var list2 = this._toc.querySelectorAll(".current");
			var nodes2 = Array.prototype.slice.call(list2, 0);
			nodes2.forEach(function(elem) {
				elem.classList.remove("current");
			});

			// Set current to this and level2 parent
			if (p)
			{
				p.parentNode.classList.add("current");
				p.classList.add("current");
				elem.classList.add("current");
				elem.scrollIntoView(true);
			}

			// Expand
			this.expandTocMenu(elem);

			// Fold the other level2 items
			var list3 = this._toc.querySelectorAll(".level2 > div.li.expandable");
			var nodes3 = Array.prototype.slice.call(list3, 0);
			nodes3.forEach(function(item) {
				if (item != p)
				{
					this.collapseTocMenu(item);
				}
			}.bind(this));
		}.bind(this));
	}.bind(this));

};

// Install click handler to expand/collapse toc menu
ReadtheDokus.prototype._installTocMenuHandler = function()
{

	// Search for toc menu items which have children
	var list = this._toc.querySelectorAll("div.li");
	var nodes = Array.prototype.slice.call(list, 0);
	nodes.forEach(function(elem) {
		if (elem.parentNode.querySelector(".toc"))
		{
			elem.classList.add("expandable");

			// Insert +/- fontawesome icon and image
			elem.children[0].insertAdjacentHTML("afterbegin", '<div class="btn-expand"><i class="far fa-minus-square"></i><img class="minus" src="' + DOKU_BASE + 'lib/images/minus.gif" alt="−"></div>');

			// Install click handler
			elem.children[0].children[0].addEventListener("click", function(e) {
				this.toggleTocMenu(elem);

				e.stopPropagation();
				e.preventDefault();
			}.bind(this));

			// Only level1 menu items are open at start
			if (!elem.parentNode.classList.contains("level1"))
			{
				this.collapseTocMenu(elem);
			}
		}

		// Install click handler to move an clicked item to top
		elem.addEventListener("click", function() {
			elem.scrollIntoView(true);
		});
	}.bind(this));

};

// Install click handler to jump to anchor taking fixed header into account
ReadtheDokus.prototype._installTocJumpHandler = function()
{

	var headerHeight = this._header.offsetHeight;
	var list = this._toc.querySelectorAll('a[href*="#"]');
	var nodes = Array.prototype.slice.call(list, 0);
	nodes.forEach(function(elem){
		elem.addEventListener("click", function(e) {
			var hash = elem.getAttribute("href");
			var target = document.querySelector(hash);
			if (target)
			{
				if (dokus.getMediaQuery() == "sp")
				{
					this.hideSidebar();
				}

				var top = target.getBoundingClientRect().top;
				window.scrollTo(0, window.pageYOffset + top - headerHeight);
			}

			e.preventDefault();
			return false;
		}.bind(this));
	}.bind(this));

};
ReadtheDokus.prototype._getParent = function(elem, level)
{

	let current = elem.parentNode;

	while (current && !current.classList.contains("level1"))
	{
		if (current.classList.contains(level))
		{
			return current.children[0];
		}

		current = current.parentNode.parentNode;
	}

	return null;

};

ReadtheDokus.prototype._initMobileHeader = function()
{

	// Add click event handler for mobile menu
	document.getElementById("btn-mobilemenu").addEventListener("click", function(){
		this.toggleSidebar();
	}.bind(this));

};

ReadtheDokus.prototype._initPageButtons = function()
{

	// Get current page (remove hash)
	this._currentPage = window.location.href.replace(/#.*$/, "");

	// Get current page index
	this._currentPageIndex = this._pages.indexOf(this._currentPage);

	// Show prev button
	if (this._currentPageIndex > 0)
	{
		document.getElementById("btn-prevpage").classList.remove("invisible");
		document.getElementById("btn-prevpage").href = this._pages[this._currentPageIndex - 1];
	}

	// Show next button
	if (this._currentPageIndex > -1 && this._currentPageIndex < this._pages.length - 1)
	{
		document.getElementById("btn-nextpage").classList.remove("invisible");
		document.getElementById("btn-nextpage").href = this._pages[this._currentPageIndex + 1];
	}

};
