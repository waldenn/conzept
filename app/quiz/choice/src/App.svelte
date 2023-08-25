<script>
  import ArtistButton from './lib/ArtistButton.svelte';
  import Loading from './lib/Loading.svelte';
  import * as Wikidata from './lib/wikidata.js';

  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
  }

  let paintings = [];
  let imgsrc;
  let randomIndex;
  let randomPainting;
  let reveal;

  let showLoading = true;

  Wikidata.queryDispatcher.query(Wikidata.paintersQuery).then(res => {
    showLoading = false;
    paintings = res.results.bindings;
    randomIndex = getRandomInt(0,5);
    randomPainting = paintings[randomIndex];
    imgsrc = randomPainting.image.value;
  });

  function revealAnswer() {
    reveal = true;

    paintings.forEach(p => {
      if (p.correct !== "right") {
        p.correct = "wrong";
      }
    });
  }

  function handleClick(event) {
    const index = event.detail.index;
    if (index === randomIndex) {
      paintings[index].correct = "right";
      revealAnswer();
    } else {
      paintings[index].correct = "wrong";
    }

    const title = paintings[index].painterLabel.value;
    const qid   = paintings[index].painter.value.split('/').pop();
    //console.log( title, paintings[index] );
    window.gotoPage( qid, title );
  }

</script>

<!--h1>?</h1-->

{#if showLoading}
  <Loading/>
{:else}
  <img src="{imgsrc}" alt="A random painting" />
{/if}

{#if reveal}
  <p>
    <a href={randomPainting.painting.value} target="_blank">
      {randomPainting.painterLabel.value} -
      {randomPainting.paintingLabel.value}
    </a>
  </p>

  <p>
    <button onClick="window.location.reload();"><strong><span class="reload">⟳</span></strong></button>
  </p>
{/if}

{#each paintings as painting, index}
<p>
  <ArtistButton
    on:message={handleClick}
    index={index}
    artistName={painting.painterLabel.value}
    correct={painting.correct}
  />
</p>
{/each}

<p class="notes">
  Powered by <a href="https://www.wikidata.org/">Wikidata</a>.
  Source code is <a href="https://github.com/dhinus/wikidata-painters/">here</a>.
</p>

<style>
  .reload {
    font-size: 3em;
  }
  .notes {
    font-size: 0.8em;
    margin-top: 5em;
  }
  img {
    max-width: 80%;
    max-height: 70vh;
    filter: drop-shadow(0 .15rem .15rem gray);
    border-radius: .2rem;
  }
</style>
