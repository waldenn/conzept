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
  .wrong {background: #e36868}
  .right {background: #68e378}
</style>
