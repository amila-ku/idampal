<script>
  import { onMount } from "svelte";

  import PostForm from "../components/PostForm.svelte";

  let postLimit = 6;
  let currentDate = new Date();

  const apiBaseUrl =
    "http://localhost:1323";
  let posts = [];
  let twposts = [];
  let editingPost = {
    body: "",
    title: "",
    id: null
  };

  onMount(async () => {
    const res = await fetch(apiBaseUrl + "/news/headlines");
    posts = await res.json();
    const restwitter = await fetch(apiBaseUrl + "/news/twitter");
    twposts = await restwitter.json();
  });

  function addPost({ detail: post }) {
    if (posts.find(p => p.id === post.id)) {
      const index = posts.findIndex(p => p.id === post.id);
      let postsUpdated = posts;
      postsUpdated.splice(index, 1, post);
      posts = postsUpdated;
    } else posts = [post, ...posts];

    editingPost = {
      body: "",
      title: "",
      id: null
    };
  }

  function editPost(post) {
    editingPost = post;
  }
  function deletePost(id) {
    if (confirm("Are you sure?")) {
      fetch(`${apiBaseUrl}/post/${id}`, {
        method: "DELETE"
      })
        .then(res => {
          return res.json();
        })
        .then(() => {
          posts = posts.filter(p => p.id !== id);
        });
    }
  }
  function setLimit() {
    fetch(`${apiBaseUrl}/posts/${postLimit}`)
      .then(res => {
        return res.json();
      })
      .then(postsData => {
        posts = postsData;
      });
  }
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
    <div class="col-content">
      {currentDate}
    </div>
  </div>
  <!-- <div class="col s6" style="margin:50px">
    <p>Limit number of posts</p>
    <input type="number" bind:value={postLimit} />
    <button on:click={setLimit} class="waves-effect waves-light btn">
      Set
    </button>
  </div> -->
</div>

<div class="row">
  <div class="col s8 m8 ">
  <div class="col-content">
  {#if posts.length === 0}
    <h3>Loading posts...</h3>
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

<!-- <div class="row">
<div class="card">
    <div class="card-image waves-effect waves-block waves-light">
      <img class="activator" src="https://techcrunch.com/wp-content/uploads/2020/05/Luminar_Highway_Perception_to_250M.png?w=764">
    </div>
    <div class="card-content">
      <span class="card-title activator grey-text text-darken-4">Card Title<i class="material-icons right">more_vert</i></span>
      <p><a href="#">This is a link</a></p>
    </div>
    <div class="card-reveal">
      <span class="card-title grey-text text-darken-4">Card Title<i class="material-icons right">close</i></span>
      <p>Here is some more information about this product that is only revealed once clicked on.</p>
    </div>
  </div>
</div> -->


