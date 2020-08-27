(this["webpackJsonpnew-edutech"]=this["webpackJsonpnew-edutech"]||[]).push([[2],{301:function(e,t,a){"use strict";a.r(t);var o=a(0),n=a.n(o),r=a(18),i=a(132),l=a(157),c=a(53),s=a(7),m=a(135),u=a(337),d=a.n(u),g=a(92),f=a.n(g),b=a(27),p=a(216),h=a(79),y=a(194),E=a(276),w=a(634),v=a(397),I=a.n(v),N=a(281),j=a(69),k=a(278),O=a(280),L=a(654),M=a(142),P=a.n(M),T=a(198),B=a(200),R=a(275),C=function(e){return{root:{display:"flex",width:"100%",height:"100%",backgroundColor:"var(--background-color)",backgroundImage:"url(".concat(window.config?window.config.background:null,")"),backgroundAttachment:"fixed",backgroundPosition:"center",backgroundSize:"cover",backgroundRepeat:"no-repeat"},dialogTitle:{},dialogPaper:{width:"30vw",padding:e.spacing(2),[e.breakpoints.down("lg")]:{width:"40vw"},[e.breakpoints.down("md")]:{width:"50vw"},[e.breakpoints.down("sm")]:{width:"70vw"},[e.breakpoints.down("xs")]:{width:"90vw"}},logo:{display:"block",paddingBottom:"1vh"},loginButton:{position:"absolute",right:e.spacing(2),top:e.spacing(2),padding:0},largeIcon:{fontSize:"2em"},largeAvatar:{width:50,height:50},green:{color:"rgba(0, 153, 0, 1)"},red:{color:"rgba(153, 0, 0, 1)"}}},A=Object(s.a)(C)((function(e){var t=Object(o.useState)(!1),a=Object(c.a)(t,2),r=a[0],i=a[1],s=Object(p.a)();Object(o.useEffect)((function(){var e=setTimeout((function(){return i(!0)}),1e3),t=setTimeout((function(){return i(!1)}),4e3);return function(){clearTimeout(e),clearTimeout(t)}}),[]);var m=e.children,u=e.classes,g=e.myPicture,f=e.onLogin,b=e.loggedIn,h=Object(l.a)(e,["children","classes","myPicture","onLogin","loggedIn"]),y=b?s.formatMessage({id:"tooltip.logout",defaultMessage:"Log out"}):s.formatMessage({id:"tooltip.login",defaultMessage:"Log in"});return n.a.createElement(T.a,Object.assign({disableTypography:!0,className:u.dialogTitle},h),window.config.logo&&n.a.createElement("img",{alt:"Logo",className:u.logo,src:window.config.logo}),n.a.createElement(j.a,{variant:"h5"},m),window.config.loginEnabled&&n.a.createElement(L.a,{onClose:function(){i(!1)},onOpen:function(){i(!0)},open:r,title:y,placement:"left"},n.a.createElement(w.a,{"aria-label":"Account",className:u.loginButton,color:"inherit",onClick:f},g?n.a.createElement(N.a,{src:g,className:u.largeAvatar}):n.a.createElement(I.a,{className:d()(u.largeIcon,b?u.green:null)}))))})),S=Object(s.a)((function(e){return{root:{padding:e.spacing(2)}}}))(B.a),q=Object(s.a)((function(e){return{root:{margin:0,padding:e.spacing(1)}}}))(R.a),D=Object(m.b)(Object(i.b)((function(e){return{room:e.room,displayName:e.settings.displayName,displayNameInProgress:e.me.displayNameInProgress,loginEnabled:e.me.loginEnabled,loggedIn:e.me.loggedIn,myPicture:e.me.picture}}),(function(e){return{changeDisplayName:function(t){e(b.b(t))}}}),null,{areStatesEqual:function(e,t){return t.room.inLobby===e.room.inLobby&&t.room.signInRequired===e.room.signInRequired&&t.room.overRoomLimit===e.room.overRoomLimit&&t.settings.displayName===e.settings.displayName&&t.me.displayNameInProgress===e.me.displayNameInProgress&&t.me.loginEnabled===e.me.loginEnabled&&t.me.loggedIn===e.me.loggedIn&&t.me.picture===e.me.picture}})(Object(s.a)(C)((function(e){var t=e.roomClient,a=e.room,o=e.roomId,r=e.displayName,i=e.displayNameInProgress,l=e.loggedIn,c=e.myPicture,s=e.changeDisplayName,m=e.classes,u=Object(p.a)();return n.a.createElement("div",{className:m.root},n.a.createElement(y.a,{open:!0,classes:{paper:m.dialogPaper}},n.a.createElement(A,{myPicture:c,onLogin:function(){l?t.logout(o):t.login(o)},loggedIn:l},window.config.title?window.config.title:"New edutech",n.a.createElement("hr",null)),n.a.createElement(S,null,n.a.createElement(E.a,{gutterBottom:!0},n.a.createElement(h.a,{id:"room.aboutToJoin",defaultMessage:"You are about to join a meeting"})),n.a.createElement(E.a,{variant:"h6",gutterBottom:!0,align:"center"},n.a.createElement(h.a,{id:"room.roomId",defaultMessage:"Room ID: {roomName}",values:{roomName:o}})),n.a.createElement(E.a,{gutterBottom:!0},n.a.createElement(h.a,{id:"room.setYourName",defaultMessage:"Set your name for participation, \n\t\t\t\t\t\t\t\tand choose how you want to join:"})),n.a.createElement(O.a,{id:"displayname",label:u.formatMessage({id:"label.yourName",defaultMessage:"Your name"}),value:r,variant:"outlined",margin:"normal",disabled:i,onChange:function(e){var t=e.target.value;s(t)},onKeyDown:function(e){switch(e.key){case"Enter":case"Escape":""===r&&s("Guest"),a.inLobby&&t.changeDisplayName(r)}},onBlur:function(){""===r&&s("Guest"),a.inLobby&&t.changeDisplayName(r)},fullWidth:!0}),!a.inLobby&&a.overRoomLimit&&n.a.createElement(E.a,{className:m.red,variant:"h6",gutterBottom:!0},n.a.createElement(h.a,{id:"room.overRoomLimit",defaultMessage:"The room is full, retry after some time."}))),a.inLobby?n.a.createElement(S,null,n.a.createElement(E.a,{className:m.green,gutterBottom:!0,variant:"h6",style:{fontWeight:"600"},align:"center"},n.a.createElement(h.a,{id:"room.youAreReady",defaultMessage:"Ok, you are ready"})),a.signInRequired?n.a.createElement(E.a,{gutterBottom:!0,variant:"h5",style:{fontWeight:"600"}},n.a.createElement(h.a,{id:"room.emptyRequireLogin",defaultMessage:"The room is empty! You can Log In to start \n\t\t\t\t\t\t\t\t\t\tthe meeting or wait until the host joins"})):n.a.createElement(E.a,{gutterBottom:!0,variant:"h5",style:{fontWeight:"600"}},n.a.createElement(h.a,{id:"room.locketWait",defaultMessage:"The room is locked - hang on until somebody lets you in ..."}))):n.a.createElement(q,null,n.a.createElement(k.a,{onClick:function(){t.join({roomId:o,joinVideo:!1})},variant:"contained",color:"secondary"},n.a.createElement(h.a,{id:"room.audioOnly",defaultMessage:"Audio only"})),n.a.createElement(k.a,{onClick:function(){t.join({roomId:o,joinVideo:!0})},variant:"contained",color:"secondary"},n.a.createElement(h.a,{id:"room.audioVideo",defaultMessage:"Audio and Video"}))),!f()()&&n.a.createElement(P.a,{buttonText:u.formatMessage({id:"room.consentUnderstand",defaultMessage:"I understand"})},n.a.createElement(h.a,{id:"room.cookieConsent",defaultMessage:"This website uses cookies to enhance the user experience"}))))})))),x=a(121),W=a(146),V=Object(W.a)((function(){return Promise.all([a.e(0),a.e(14),a.e(6)]).then(a.bind(null,652))}));t.default=Object(i.b)((function(e){return{room:e.room}}),null,null,{areStatesEqual:function(e,t){return t.room===e.room}})((function(e){var t=e.room,a=Object(r.e)().id.toLowerCase();return Object(o.useEffect)((function(){V.preload()}),[]),t.joined?n.a.createElement(o.Suspense,{fallback:n.a.createElement(x.a,null)},n.a.createElement(V,null)):n.a.createElement(D,{roomId:a})}))}}]);
//# sourceMappingURL=app.485a6b36.chunk.js.map