MyCollection_scrap = {};
MyCollection_parse = {};
MyCollection_catalogue = {};
MyCollection_parse.auchan = new Mongo.Collection('auchan_parse');
MyCollection_parse.eleclerc = new Mongo.Collection('eleclerc_parse');
MyCollection_parse.carrefour = new Mongo.Collection('carrefour_parse');
MyCollection_parse.intermarche = new Mongo.Collection('intermarche_parse');
MyCollection_scrap.auchan = new Mongo.Collection('auchan_requests');
MyCollection_scrap.eleclerc = new Mongo.Collection('eleclerc_requests');
MyCollection_scrap.intermarche = new Mongo.Collection('intermarche_requests');
MyCollection_scrap.carrefour = new Mongo.Collection('carrefour_requests');
MyCollection_catalogue.auchan = new Mongo.Collection('auchan_catalogue');
MyCollection_catalogue.eleclerc = new Mongo.Collection('eleclerc_catalogue');
MyCollection_catalogue.carrefour = new Mongo.Collection('carrefour_catalogue');
MyCollection_catalogue.intermarche = new Mongo.Collection('intermarche_catalogue');

if (Meteor.isServer) {
  Meteor.publish('MyCollection_scrap', function(selected, sort_order, gtDate, ltDate) {
    ltDate = moment(ltDate).toDate();
    gtDate = moment(gtDate).toDate();
     return MyCollection_scrap[selected].find({timestamp: {$gte: gtDate, $lte: ltDate}}, {
      fields: {
        timestamp: 1,
        drive_id: 1,
        curl: 1
      },
      limit: 10,
      sort: {timestamp: sort_order}
    });

  });
  Meteor.publish('MyCollection_catalogue', function(selected, searchValue_text, searchValue_pack) {
    if (!searchValue_text && !searchValue_pack) {
      return MyCollection_catalogue[selected].find({}, {
        limit: 200
      });
    }
    if (!searchValue_pack && searchValue_text) {
      return MyCollection_catalogue[selected].find({'name': {$regex: searchValue_text, $options: 'i'}}, {
            limit: 200
          });
    }
    if (searchValue_pack && searchValue_text) {
      return MyCollection_catalogue[selected].find({
        'name': {$regex: searchValue_text, $options: 'i'},
        'pack': {$regex: searchValue_pack, $options: 'i'}
      },{
        limit: 200
      });
    }
    return MyCollection_catalogue[selected].find({'pack': {$regex: searchValue_pack, $options: 'i'}});
  });

  Meteor.publish('MyCollection_parse', function(selected, searchValue_text, searchValue_pack, sort_order, gtDate, ltDate, bolean_ean) {
    if (!sort_order)
      sort_order = -1;
    if (!bolean_ean)
      bolean_ean = -1;
    ltDate = moment(ltDate).toDate();
    gtDate = moment(gtDate).toDate();

    if (!searchValue_text && !searchValue_pack){
      return MyCollection_parse[selected].find({timestamp: {$gte: gtDate, $lte: ltDate}}, {
        fields: {
          timestamp: 1,
          sId: 1,
          sPrixUnitaire: 1,
          ean: 1,
          sLibelleLigne1: 1,
          sLibelleLigne2: 1,
          Categorie: 1,
          vintage: 1
        },
        limit: 500,
        sort: {timestamp: sort_order, ean: bolean_ean}

      });
    }
    if(!searchValue_pack && searchValue_text){
      return MyCollection_parse[selected].find({ 'sLibelleLigne1': {$regex: searchValue_text, $options:'i'}, timestamp: {$gte: gtDate, $lte: ltDate}}, {
        fields: {
          timestamp: 1,
          sId: 1,
          sPrixUnitaire: 1,
          ean: 1,
          sLibelleLigne1: 1,
          sLibelleLigne2: 1,
          Categorie: 1,
          vintage: 1
        },
        timestamp: {
          $gte: gtDate,
          $lt: ltDate
        },
        limit: 500,
        sort: {timestamp: sort_order, ean: bolean_ean}
      });
    }
    if (searchValue_pack && searchValue_text){
      return MyCollection_parse[selected].find({ 'sLibelleLigne1': {$regex: searchValue_text, $options:'i'}, 'sLibelleLigne2': {$regex: searchValue_pack, $options:'i'}, timestamp: {$gte: gtDate, $lte: ltDate}}, {
        fields: {
          timestamp: 1,
          sId: 1,
          sPrixUnitaire: 1,
          ean: 1,
          sLibelleLigne1: 1,
          sLibelleLigne2: 1,
          Categorie: 1,
          vintage: 1
        },
        timestamp: {
          $gte: gtDate,
          $lt: ltDate
        },
        limit: 500,
        sort: {timestamp: sort_order, ean: bolean_ean}
      });
    }
    return MyCollection_parse[selected].find({ 'sLibelleLigne2': {$regex: searchValue_pack, $options:'i'}, timestamp: {$gte: gtDate, $lte: ltDate}}, {
      fields: {
        timestamp: 1,
        sId: 1,
        sPrixUnitaire: 1,
        ean: 1,
        sLibelleLigne1: 1,
        sLibelleLigne2: 1,
        Categorie: 1,
        vintage: 1
      },
      timestamp: {
        $gt: gtDate,
        $lt: ltDate
      },
      limit: 300,
      sort: {timestamp: sort_order, ean: bolean_ean}
    });
  });
  Meteor.publish('TaskDetail', function(selected, ids) {
    return MyCollection_scrap[selected].find({_id: {
      $in : ids
    }});
  });
}

if (Meteor.isClient) {
  var choosen = new ReactiveVar();
  choosen.set('carrefour');

  var table_mode = new ReactiveVar();
  table_mode.set('Scraping');

  Session.set('showDetailOf', []);
  Session.set('sort_order', -1);
  Session.set('bolean', -1);
  Session.set('ltDate', new Date());
  Session.set('gtDate', new Date(0));

  Tracker.autorun(function () {
    Meteor.subscribe('MyCollection_scrap', choosen.get(), Session.get('sort_order'), Session.get('gtDate'), Session.get('ltDate'));
    Meteor.subscribe('MyCollection_parse', choosen.get(), Session.get('searchValue'), Session.get('searchValue_pack'), Session.get('sort_order'), Session.get('gtDate'), Session.get('ltDate'), Session.get('bolean'));
    Meteor.subscribe('MyCollection_catalogue', choosen.get(), Session.get('searchValue'), Session.get('searchValue_pack'));
    Meteor.subscribe('TaskDetail', choosen.get(), Session.get('showDetailOf'));
  });

  Template.body.helpers({
    search_table: function () {
      final = "";
      if (Session.get('searchValue')) {
        final = Session.get('searchValue').concat(" ");
      }
      if (Session.get('searchValue_pack')) {
        final = final.concat(Session.get('searchValue_pack'));
      }
      return final;
    },
    tasks_scrap: function () {
      return MyCollection_scrap[choosen.get()].find({}, {
        sort: {timestamp: -1}
      });
    },
    tasks_parse: function () {
      return MyCollection_parse[choosen.get()].find({}, {
        sort: {timestamp: -1}
      });
    },
    tasks_ref: function () {
      return MyCollection_catalogue[choosen.get()].find({});
    },
    collection_name: function () {
      return choosen.get();
    },
    isScraping: function () {
      if (table_mode.get() === 'Scraping') {
        return true;
      }
    },
    isRef: function () {
      if (table_mode.get() === 'Ref') {
        return true;
      }
    }
  });

  Template.body.events({
    "click .ean_sort": function () {
      if (Session.get("bolean") === -1) {
        Session.set('bolean', 1);
      }
      else
        Session.set('bolean', -1);
    }
  });

  Template.Task_parse.events({
    "click .delete": function () {
      MyCollection_parse[choosen.get()].remove(this._id)
    },
    "click .addlist": function () {
      push = {
        "title": this.sLibelleLigne1,
        "Packaging": this.sLibelleLigne2,
        "Idproduit": this.sId,
        "Fournisseur": choosen.get()
      };
      Collection_ref.insert(push);
    }
  });

  Template.Task_scrap.events({
    "click .delete": function () {
      MyCollection_scrap[choosen.get()].remove(this._id)
    },
    "click .download": function () {
      var ids = Session.get('showDetailOf');
      Session.set('showDetailOf', ids.push(this._id._str));
    }
  });

  Template.Task_scrap.helpers({
    isCLicked: function () {
      if (this._id in Session.get('showDetailOf')) {
        return Session.get(this._id);
      }
    },
    show_content: function () {
      return JSON.stringify(
          MyCollection_scrap[choosen.get()].findOne(this._id).content
      );
    }
  });

  Template.Task_ref.events({
    "click .delete": function () {
      MyCollection_catalogue[choosen.get()].remove(this._id);
    }
  });

  Template.globale_button.events({
    "click .collection1": function () {
      choosen.set('eleclerc');
    },
    "click .collection2": function () {
      choosen.set('auchan');
    },
    "click .collection3": function () {
      choosen.set('intermarche');
    },
    "click .collection4": function () {
      choosen.set('carrefour');
    },
    "click .Scraping": function () {
      table_mode.set('Scraping');
    },
    "click .Parsing": function () {
      table_mode.set('Parsing');
    },
    "click .Refing": function () {
      table_mode.set('Ref');
    }
  });

  Template.search_button.events({
    "submit .search_title": function (event) {
      event.preventDefault();
      var text = event.target.text.value;
      Session.set('searchValue', text);
      event.target.text.value = "";
    },
    "submit .search_pack": function (event) {
      event.preventDefault();
      var text = event.target.text.value;
      Session.set('searchValue_pack', text);
      event.target.text.value = "";
    },
    "click .clear_text": function () {
      Session.set('searchValue', "");
    },
    "click .clear_pack": function () {
      Session.set('searchValue_pack', "");
    },
    "click .sort": function () {
      if (Session.get("sort_order") === -1) {
        Session.set('sort_order', 1);
      }
      else
        Session.set('sort_order', -1);
    },
    "submit .search_timestamp_gt": function (event) {
      event.preventDefault();
      var text = event.target.text.value;
      Session.set('gtDate', text);
      event.target.text.value = "";
    },
    "submit .search_timestamp_lt": function (event) {
      event.preventDefault();
      var text = event.target.text.value;
      Session.set('ltDate', text);
      event.target.text.value = "";
    },
    "click .clear_gt": function () {
      Session.set('gtDate', new Date(0));
    },
    "click .clear_lt": function () {
      Session.set('ltDate', new Date());
    }
  });

  Template.search_button.helpers({
    isParsing: function () {
      if (table_mode.get() === 'Parsing') {
        return true;
      }
    },
    isRef: function() {
      if(table_mode.get() === 'Ref'){
        return true;
      }
    },
    isScrap: function () {
    if (table_mode.get() === 'Scraping'){
      return true;
      }
    },
    search_timestamp_gt: function () {
      return Session.get('gtDate');
    },
    search_timestamp_lt: function () {
      return Session.get('ltDate');
    }
  });
}
