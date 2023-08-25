<script>
  export let artistName, correct, index;

  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  function click() {
    dispatch('message', {
      index
    });
  }
</script>

<button
  class:right="{correct === 'right'}"
  class:wrong="{correct === 'wrong'}"
  on:click={click}>
  {artistName}
</button>

<style>
  .wrong {background: #dd5d5dcf}
  .right {background: #31bd43d9}
</style>
