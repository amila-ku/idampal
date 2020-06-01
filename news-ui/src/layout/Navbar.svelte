<script>
  import { Link } from "svelte-routing";
</script>

<style>
  nav {
    background-color:#000099;
  }
</style>

<nav>
  <div class="nav-wrapper">
    <div class="container">
      <Link to="/">
        <span class="brand-logo">News Front</span>
      </Link>
      <ul id="nav-mobile" class="right hide-on-med-and-down">
        <li>
          <Link to="/">Global</Link>
        </li>
        <li>
          <Link to="/business">Business</Link>
        </li>
        <li>
          <Link to="/technology">Technology</Link>
        </li>
      </ul>
    </div>
  </div>
</nav>
