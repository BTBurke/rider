<script context="module">
	export async function load({ session }) {
        if (dev) {
            return {
                status: 302,
                redirect: '/ride/00001'
            }
        }
		if (!session.user) {
			return {
				status: 302,
				redirect: '/login'
			};
		}
		return {};
	}
</script>