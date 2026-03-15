export function getMonth(number){

  if(number < 1 || number > 12) return -1;

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "June","July", "Aug", "Sep", "Oct", "Nov", "Dec"
  ]

  return months[number-1];

}

export function getDate(post){

  if(!post.published_at) return;

  const post_time = post.published_at?.split('T');
  const date = post_time[0].split('-');
  const day = parseInt(date[2]);
  const month = getMonth(parseInt(date[1]));
  if(month === -1){
    console.error("Invalid Month");
    return;
  }
  const date_tag = `${day} ${month}`;

  return date_tag;
}

export function getTagByID(v_tags, id) {
  return v_tags.find(tag => tag.id === id) ?? null;
}

export function getTagByName(v_tags, name) {
  return v_tags.find(tag => tag.name === name) ?? null;
}

export function getTags(v_tags){

  const tags = [];

  v_tags.forEach(tag => {
    tags.push(tag.name);
  });

  return tags;
}

export function getAllTagsF(v_posts){

  const tags = [];

  v_posts.forEach(post => {

    post.tags.forEach(tag => {
      if( contains(tag.name, tags) === -1 )
        tags.push(tag);
    })

  })

  return tags;

}


export function getAllTags(v_posts){

  const tags = [];

  v_posts.forEach(post => {

    post.tags.forEach(tag => {
      if( contains(tag.name, tags) === -1 )
        tags.push(tag.name);
    })

  })

  return tags;

}

/*
  Ghost function or a later update in author []
*/

export function getMainAuthor(authors){

  return authors[0].name;

}

export function contains(x, v){

  for(let i = 0; i<v.length; ++i){
    if(v[i] === x) return i;
  }

  return -1;

}

export function getSlugFromTitle(title){

  return title.toLowerCase()
              .replace(/\s+/g, "-") //Replaces whitespace characters for -
              .replace(/[^\w-]/g, ""); //Deletes anything that isnt a word character
          
}
