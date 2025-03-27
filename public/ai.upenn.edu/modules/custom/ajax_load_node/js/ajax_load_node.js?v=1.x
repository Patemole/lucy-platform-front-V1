/**
 * @file
 * Javascript, modifications of DOM.
 *
 * Manipulates links to include jquery load funciton
 */
(function ($, Drupal, drupalSettings) {
  $(window).on("load",function() {

    var trigger = drupalSettings.ajax_load_node_trigger;
    var target = drupalSettings.ajax_load_node_target;
    // Puede ser más de un valor, hay que usar foreach()
    
    $.fn.prepare_link = function() {
      var html_string = $(this).attr( 'href' );
      // Hay que validar si la ruta trae la URL del sitio
      $(this).attr( 'href' , target );
      var data_target = $(this).data('target');
      if (typeof data_target === 'undefined' ) {
        data_target = target;
      }
      else {
        data_target = '#' + data_target;
      }
      $(this).click(function(evt) {
        evt.preventDefault();
        jquery_ajax_load_load($(this), data_target, html_string);
      });
    };
    $(once(trigger,trigger)).prepare_link();
    $(trigger).removeClass(trigger);



  // Handles link calls
  function jquery_ajax_load_load(el, target, url) {
    var module_path = drupalSettings.ajax_load_node_module_path;
    var toggle = drupalSettings.ajax_load_node_toggle;
    var base_path = drupalSettings.ajax_load_node_base_path;
    var animation = drupalSettings.ajax_load_node_animation;
    if( toggle && $(el).hasClass( "jquery_ajax_load_open" ) ) {
      $(el).removeClass( "jquery_ajax_load_open" );
      if ( animation ) {
        $(target).hide('slow', function() {
          $(target).empty();
        });
      }
      else {
        $(target).empty();
      }
    }
    else {
      var loading_html = Drupal.t('Loading'); 
      loading_html += '... <img src="/';
      loading_html += module_path;
      loading_html += '/jquery_ajax_load_loading.gif">';
      $(target).html(loading_html);
      $(target).load(base_path + 'jquery_ajax_load/get' + url, function( response, status, xhr ) {
        if ( status == "error" ) {
          var msg = "Sorry but there was an error: ";
          $(target).html( msg + xhr.status + " " + xhr.statusText );
        }
        else {
          if ( animation ) {
            $(target).hide();
            $(target).show('slow')
          }
          //        Drupal.attachBehaviors(target);
        }
      });
      $(el).addClass( "jquery_ajax_load_open" );
    }
  }


  
  
  function Utils() {

  }

  Utils.prototype = {
    constructor: Utils,
    isElementInView: function (element, fullyInView) {
      var pageTop = $(window).scrollTop();
      var pageBottom = pageTop + $(window).height();
      var elementTop = $(element).offset().top;
      var elementBottom = elementTop + $(element).height();
      
      if (fullyInView === true) {
        return ((pageTop < elementTop) && (pageBottom > elementBottom));
      } else {
        return ((elementTop <= pageBottom) && (elementBottom >= pageTop));
      }
    }
  };

  var Utils = new Utils();

  var showRelated = function() {
    if($('a.jquery_ajax_load').length) { 
      var isElementInView = Utils.isElementInView($('a.jquery_ajax_load'), false);
      
      if (isElementInView) {
        var url = $('a.jquery_ajax_load').attr('pageurl');
        var title = $('a.jquery_ajax_load').attr('pagetitle');
        var entityLabel = $('a.jquery_ajax_load').attr('entityLabel');
        var postDate = $('a.jquery_ajax_load').attr('postDate');
        var joinTags = $('a.jquery_ajax_load').attr('joinTags');
        var joinCategories = $('a.jquery_ajax_load').attr('joinCategories');
        var biographieAuteur = $('a.jquery_ajax_load').attr('biographieAuteur');
        var auteur = $('a.jquery_ajax_load').attr('auteur');
        var entityBundle = $('a.jquery_ajax_load').attr('entityBundle');


        $('a.jquery_ajax_load').click();

        window.dataLayer.push({
          'event': 'VirtualPageView',
          'event_url': url,
          'event_entityLabel': entityLabel,
          'event_postDate': postDate,
          'event_joinTags': joinTags,
          'event_joinCategories': joinCategories,
          'event_biographieAuteur': biographieAuteur,
          'event_auteur': auteur,
          'event_entityBundle': entityBundle,
          'event_title': title
        });
        
        $('a.jquery_ajax_load').hide();
        $('a.jquery_ajax_load').removeClass("jquery_ajax_load");


      }
    } 
  };
  
  $(window).on( "scroll", showRelated);
  $(window).on( "load", showRelated);

  });
})(jQuery, Drupal, drupalSettings);
