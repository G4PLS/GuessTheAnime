import{a,w,v as j,p as e}from"./chunk-PVWAREVJ-C6codAFB.js";import{d}from"./database-D5w6OURp.js";function N({title:l,titleId:r,...s},o){return a.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 16 16",fill:"currentColor","aria-hidden":"true","data-slot":"icon",ref:o,"aria-labelledby":r},s),l?a.createElement("title",{id:r},l):null,a.createElement("path",{fillRule:"evenodd",d:"M13.836 2.477a.75.75 0 0 1 .75.75v3.182a.75.75 0 0 1-.75.75h-3.182a.75.75 0 0 1 0-1.5h1.37l-.84-.841a4.5 4.5 0 0 0-7.08.932.75.75 0 0 1-1.3-.75 6 6 0 0 1 9.44-1.242l.842.84V3.227a.75.75 0 0 1 .75-.75Zm-.911 7.5A.75.75 0 0 1 13.199 11a6 6 0 0 1-9.44 1.241l-.84-.84v1.371a.75.75 0 0 1-1.5 0V9.591a.75.75 0 0 1 .75-.75H5.35a.75.75 0 0 1 0 1.5H3.98l.841.841a4.5 4.5 0 0 0 7.08-.932.75.75 0 0 1 1.025-.273Z",clipRule:"evenodd"}))}const v=a.forwardRef(N),L="https://graphql.anilist.co",E=`
query MediaListCollection($userName: String) {
  MediaListCollection(userName: $userName, type: ANIME) {
    lists {
      name
      entries {
        media {
          title {
            english
            romaji
          }
          format
          seasonYear
          season
          description
          genres
          episodes
          averageScore
          popularity
          tags {
            name
            description
            rank
          }
          reviews(sort: RATING) {
            nodes {
              summary
            }
          }
          studios(isMain: true) {
            edges {
              isMain
              node {
                id
                name
              }
            }
          }
          coverImage {
            large
          }
          rankings {
            rank
            context
          }
          relations {
            edges {
              node {
                title {
                  romaji
                }
                format
              }
              relationType
            }
          }
          recommendations(sort: RATING_DESC){
            nodes {
              mediaRecommendation {
                coverImage {
                  medium
                }
              }
            }
          }
        }
        score
        user {
          mediaListOptions {
            scoreFormat
          }
        }
      }
    }
  }
}`;async function S(l){const r={userName:l};try{const s=await fetch(L,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({query:E,variables:r})});if(!s.ok)throw new Error("GraphQL Request failed"+s.bodyUsed);return(await s.json()).data}catch(s){return console.error("Error fetching medialist: ",s),null}}const R=w(function(){const r=j(),[s,o]=a.useState(!1),[h,u]=a.useState(null),[i,g]=a.useState(""),[m,x]=a.useState([]),[c,p]=a.useState([]);a.useEffect(()=>{d.settings.get("current").then(t=>{t&&(console.log(t),g(t.username),p(t.selectedLists))}),f()},[]);const f=async()=>{x(await d.getMediaLists())},b=async t=>{console.log("HANDLING FETCH"),t.preventDefault(),o(!0);try{if(!i)return;const n=await S(i);n?(u(null),await d.createFromMediaListCollectionResponse(i,n),f()):u("Failed to fetch media list. Please check your username.")}catch(n){console.error(n),u("An unexpected error occurred.")}finally{o(!1)}};return e.jsx("div",{className:"flex w-full h-full justify-center items-center",children:e.jsxs("form",{onSubmit:b,className:"bg-blue-950 shadow-xl rounded-2xl p-6 flex flex-col gap-6 w-96",children:[e.jsx("h2",{className:"text-2xl font-bold text-center text-white",children:"Guess the Anime"}),h&&e.jsx("p",{className:"text-red-400 text-sm",children:h}),e.jsxs("div",{children:[e.jsx("label",{htmlFor:"username-entry",className:"block text-sm font-medium text-gray-200",children:"AniList Username"}),e.jsxs("div",{className:"flex flex-row gap-3",children:[e.jsx("input",{type:"text",id:"username-entry",placeholder:"Enter your AniList name",value:i??"",onChange:t=>g(t.target.value),className:"mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-500"}),e.jsx("button",{type:"submit",className:"bg-blue-600 cursor-pointer text-white rounded-lg p-2 flex justify-center items-center transition hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-default disabled:hover:bg-blue-400",disabled:s||!i,children:s?e.jsx("div",{className:"w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"}):e.jsx(v,{className:"w-5 h-5"})})]})]}),m&&e.jsx("div",{children:e.jsxs("fieldset",{className:"flex flex-col gap-3 p-4 border border-gray-700 rounded-lg bg-gray-900 text-white",children:[e.jsx("legend",{className:"font-semibold text-lg mb-2",children:"Fetched Lists"}),m.map(t=>e.jsxs("label",{className:"flex justify-between items-center gap-3 p-2 rounded hover:bg-gray-800 cursor-pointer transition",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("input",{type:"checkbox",checked:c.includes(t.name),onChange:()=>{let n;c.includes(t.name)?n=c.filter(y=>y!==t.name):n=[...c,t.name],p(n),d.settings.update("current",{selectedLists:n})},className:"w-4 h-4 accent-blue-500"}),e.jsx("span",{className:"font-medium",children:t.name})]}),e.jsxs("span",{className:"text-gray-400 text-sm",children:[t.entries.length," entries"]})]},t.name))]})}),e.jsx("button",{type:"button",onClick:async()=>{await d.resetGuesses(),r("/game")},className:"bg-blue-600 cursor-pointer text-white rounded-lg p-2 flex justify-center items-center transition hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-default disabled:hover:bg-blue-400",disabled:s||!i||m.length===0||c.length===0,children:"Start Game"})]})})});export{R as default};
