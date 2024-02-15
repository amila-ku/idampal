<script>
  import { onMount } from "svelte";

  const apiBaseUrl =
    "http://localhost:8080";
  let posts = [];
  let twposts = [];
  let editingPost = {
    body: "",
    title: "",
    id: null
  };

  onMount(async () => {
    const res = await fetch(apiBaseUrl + "/news/technology");
    posts = await res.json();

    // const restwitter = await fetch(apiBaseUrl + "/news/twitter/technology");
    // twposts = await restwitter.json();
  });
  
</script>

<style>
  .responsive {
    width: 100%;
    height: auto;
  }
  .delete-btn {
    color: red !important;
  }
  .card .card-content .card-title {
    margin-bottom: 0;
  }
  .card .card-content p.timestamp {
    color: #999;
    margin-bottom: 10px;
  }

  .card-limit {
    height: 200px;
    width: auto;
  }

  .limit {
    column-gap: 40px;
  }

</style>

<div class="row">
  <div class="col s6">
    <br>
  </div>
</div>

<div class="row">
  <div class="col s8 m8 ">
  <div class="col-content">
  {#if posts.length === 0}
    <h3>Getting Tech Articles...</h3>
  {:else}
    {#each posts as post}
      <!-- <div class="row">  -->
        <div class="row" style="margin:5px">
          <!-- Card Content -->
          <div class="card horizontal">
            <div class="card-image waves-effect waves-block waves-light">
              <img class="activator" src={post.urlToImage}>
            </div>
            <div class="card-stacked">
              <div class="card-content">
                <span class="card-title activator grey-text text-darken-4">{post.title}</span>
                <p class="timestamp">{post.publishedAt}</p>
                <!-- <p>{post.content}</p> -->
              </div>
              <div class="card-action">
                <a href={post.url}>View more</a>
              </div>
            </div>
          </div>
        </div>
    {/each}

  {/if}
  </div>
  </div>

  <div class="col s3 m3">
  <div class="col-content">
  <div class="row">
  <!-- <h5 class="blue-text">Top Tweets</h5> -->
      <div class="card horizontal blue">
        <div class="card-stacked">
            <div class="card-content">
              <h7 class="center white-text bold">Top Tweets</h7>
            </div>
        </div>
      </div>
  </div>

  {#each twposts as post}
      <!-- <div class="row">  -->
        <div class="row">
          <!-- Card Content -->
          <div class="card horizontal">
            <div class="card-stacked">
              <div class="card-content">
                <!-- <span class="card-title activator grey-text text-darken-2">{tarticle.text}</span> -->
                <p class="bold">{post.user}</p>
                <br/>
                <!-- <p class="timestamp">{tarticle.created_at}</p> -->
                <p class="blue-text" style="font-size: large">{post.text}</p>
              </div>
              <!-- <div class="card-action">
                <a href="#">View more</a>
              </div> -->
            </div>
          </div>
        </div>
    {/each}
  </div>
  
  </div>

  

</div>