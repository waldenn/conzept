<script>
  import loading from '../assets/wikidata.svg'
</script>

<img class="loading" src="{loading}" alt="Loading" />

<style>
  @keyframes flickerAnimation {
    0%   { opacity:1; }
    50%  { opacity:0; }
    100% { opacity:1; }
  }
  @-o-keyframes flickerAnimation{
    0%   { opacity:1; }
    50%  { opacity:0; }
    100% { opacity:1; }
  }
  @-moz-keyframes flickerAnimation{
    0%   { opacity:1; }
    50%  { opacity:0; }
    100% { opacity:1; }
  }
  @-webkit-keyframes flickerAnimation{
    0%   { opacity:1; }
    50%  { opacity:0; }
    100% { opacity:1; }
  }
  .loading {
    width: 300px;
    -webkit-animation: flickerAnimation 3s infinite;
    -moz-animation: flickerAnimation 3s infinite;
    -o-animation: flickerAnimation 3s infinite;
    animation: flickerAnimation 3s infinite;
  }
</style>
