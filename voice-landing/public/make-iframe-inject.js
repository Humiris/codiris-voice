/**
 * make-iframe-inject.js
 * Injecté dans l’iframe (sandbox Next.js)
 * Mode edit OFF par défaut
 */

(() => {
	// Sécurité basique
	if (window.__MAKE_EDIT_SCRIPT_LOADED__) return;
	window.__MAKE_EDIT_SCRIPT_LOADED__ = true;

	let editMode = false;
	let overlay = null;
	let lastEl = null;

	/* ----------------------------------------
	 * Utils
	 * --------------------------------------*/

	function createOverlay() {
		const el = document.createElement("div");
		el.style.position = "fixed";
		el.style.pointerEvents = "none";
		el.style.zIndex = "2147483647";
		el.style.border = "2px solid #7c3aed"; // violet figma-like
		el.style.background = "rgba(124,58,237,0.08)";
		el.style.borderRadius = "4px";
		el.style.display = "none";
		document.body.appendChild(el);
		return el;
	}

	function updateOverlay(target) {
		const rect = target.getBoundingClientRect();
		overlay.style.display = "block";
		overlay.style.left = rect.left + "px";
		overlay.style.top = rect.top + "px";
		overlay.style.width = rect.width + "px";
		overlay.style.height = rect.height + "px";
	}

	function hideOverlay() {
		overlay.style.display = "none";
	}

	function getCssSelector(el) {
		if (!(el instanceof Element)) return null;
		const path = [];
		while (el && el.nodeType === 1 && el !== document.body) {
			let selector = el.tagName.toLowerCase();
			if (el.id) {
				selector += "#" + el.id;
				path.unshift(selector);
				break;
			} else {
				const sibs = Array.from(el.parentNode.children).filter(
					(e) => e.tagName === el.tagName,
				);
				if (sibs.length > 1) {
					selector += ":nth-of-type(" + (sibs.indexOf(el) + 1) + ")";
				}
				path.unshift(selector);
			}
			el = el.parentElement;
		}
		return path.join(" > ");
	}

	function extractElementData(el) {
		const rect = el.getBoundingClientRect();
		return {
			tag: el.tagName.toLowerCase(),
			text: (el.innerText || "").slice(0, 200),
			cssSelector: getCssSelector(el),
			bounding: {
				x: rect.x,
				y: rect.y,
				width: rect.width,
				height: rect.height,
			},
		};
	}

	/* ----------------------------------------
	 * Handlers
	 * --------------------------------------*/

	function onMouseMove(e) {
		if (!editMode) return;
		const el = document.elementFromPoint(e.clientX, e.clientY);
		if (!el || el === overlay || el === document.body || el === lastEl) return;
		lastEl = el;
		updateOverlay(el);
	}

	function onClick(e) {
		if (!editMode) return;
		e.preventDefault();
		e.stopPropagation();

		const el = document.elementFromPoint(e.clientX, e.clientY);
		if (!el) return;

		const payload = extractElementData(el);

		window.parent.postMessage(
			{
				type: "MAKE_ELEMENT_SELECTED",
				payload,
			},
			"*",
		);
	}

	/* ----------------------------------------
	 * Mode control
	 * --------------------------------------*/

	function enableEditMode() {
		if (editMode) return;
		editMode = true;

		if (!overlay) overlay = createOverlay();

		document.addEventListener("mousemove", onMouseMove, true);
		document.addEventListener("click", onClick, true);
		document.body.style.cursor = "crosshair";
	}

	function disableEditMode() {
		editMode = false;
		hideOverlay();

		document.removeEventListener("mousemove", onMouseMove, true);
		document.removeEventListener("click", onClick, true);
		document.body.style.cursor = "";
	}

	/* ----------------------------------------
	 * Message bridge
	 * --------------------------------------*/

	window.addEventListener("message", (e) => {
		if (!e.data || !e.data.type) return;

		switch (e.data.type) {
			case "MAKE_EDIT_MODE_ON":
				enableEditMode();
				break;

			case "MAKE_EDIT_MODE_OFF":
				disableEditMode();
				break;
		}
	});

	/* ----------------------------------------
	 * Hot reload resilience
	 * --------------------------------------*/

	window.addEventListener("beforeunload", () => {
		disableEditMode();
	});
})();